# ===================================================================
# N-Body Orbit Simulation: Sun + Earth + Asteroid (Fixed & Improved)
# ===================================================================
# Requires: httr, jsonlite, rgl, magrittr, htmlwidgets
# install.packages(c("httr","jsonlite","rgl","magrittr","htmlwidgets"))

library(httr)
library(jsonlite)
library(rgl)
library(magrittr)
library(htmlwidgets)

# -------------------------------------------------------------------
# Constants (SI)
# -------------------------------------------------------------------
G <- 6.67430e-11          # m^3 kg^-1 s^-2
AU <- 1.495978707e11      # m
DAY_S <- 86400            # seconds per day

MASS <- c(                 # masses in kg
  sun = 1.98847e30,
  earth = 5.97219e24,
  asteroid = 0            # asteroid treated as test particle (no effect on others)
)

# -------------------------------------------------------------------
# Helper: Fetch asteroid orbital elements from JPL SBDB
# -------------------------------------------------------------------
get_asteroid_data <- function(asteroid_name) {
  url <- paste0("https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=", URLencode(asteroid_name))
  response <- GET(url)
  if (status_code(response) != 200) stop("Failed to fetch data from JPL. Status code: ", status_code(response))
  data <- fromJSON(content(response, "text", encoding = "UTF-8"))
  if (!is.null(data$code) || is.null(data$orbit) || is.null(data$orbit$elements)) {
    err <- if (!is.null(data$message)) data$message else "Object not found or no orbital data."
    stop("JPL API error: ", err)
  }
  cat("✅ Successfully fetched data for:", data$object$fullname, "\n")
  return(data$orbit$elements)
}

# -------------------------------------------------------------------
# Kepler solver (Newton iteration)
# -------------------------------------------------------------------
KeplerSolve <- function(e, M) {
  Mnorm <- (M + pi) %% (2*pi) - pi   # normalize
  E <- if (abs(e) < 0.8) Mnorm else pi
  tol <- 1e-14
  for (k in 1:200) {
    f <- E - e * sin(E) - Mnorm
    fp <- 1 - e * cos(E)
    dE <- f / fp
    E <- E - dE
    if (abs(dE) < tol) break
  }
  return(E)
}

# -------------------------------------------------------------------
# Convert orbital elements to inertial state [x,y,z,vx,vy,vz] (SI)
# elements: data.frame or list with fields name & value (like JPL API)
# center_mass: central mass in kg (e.g., Sun mass)
# -------------------------------------------------------------------
convert_elements_to_state <- function(elements, center_mass) {
  # elements might be a data.frame with 'name' and 'value' columns,
  # or a list of rows as returned by the API. We'll normalize access.
  get_val <- function(nm) {
    if (is.data.frame(elements)) {
      idx <- grep(paste0("^", nm, "$"), elements$name, ignore.case = TRUE)
      if (length(idx) == 0) stop("Missing orbital element: ", nm)
      return(as.numeric(elements$value[idx[1]]))
    } else if (is.list(elements)) {
      idx <- which(sapply(elements, function(x) tolower(x$name) == tolower(nm)))
      if (length(idx) == 0) stop("Missing orbital element: ", nm)
      return(as.numeric(elements[[idx[1]]]$value))
    } else stop("Unsupported elements structure.")
  }
  
  # Elements (JPL usually in AU, degrees)
  a_AU <- get_val("a")      # semimajor axis (AU)
  a <- a_AU * AU
  e <- as.numeric( get_val("e") )
  i <- get_val("i") * pi / 180
  om <- get_val("om") * pi / 180  # longitude of ascending node Ω
  w  <- get_val("w")  * pi / 180  # argument of perihelion ω
  ma <- get_val("ma") * pi / 180  # mean anomaly (radians)
  
  # Eccentric anomaly
  E <- KeplerSolve(e, ma)
  
  # Distance and perifocal coords
  r_mag <- a * (1 - e * cos(E))
  # true anomaly ν (optional)
  nu <- 2 * atan2(sqrt(1+e) * sin(E/2), sqrt(1-e) * cos(E/2))
  
  # Position in perifocal coordinates (m)
  r_pf <- r_mag * c(cos(nu), sin(nu), 0)
  
  # Perifocal velocity components (m/s)
  mu <- G * center_mass
  p <- a * (1 - e^2)
  # Standard perifocal velocity:
  v_pf <- sqrt(mu / p) * c(-sin(nu), e + cos(nu), 0)
  
  # Rotation: r_ecl = Rz(Ω) * Rx(i) * Rz(ω) * r_pf
  Rz <- function(th) matrix(c(cos(th), -sin(th), 0,
                              sin(th),  cos(th), 0,
                              0,          0,     1), nrow=3, byrow=TRUE)
  Rx <- function(th) matrix(c(1, 0,          0,
                              0, cos(th), -sin(th),
                              0, sin(th),  cos(th)), nrow=3, byrow=TRUE)
  
  rot <- Rz(om) %*% Rx(i) %*% Rz(w)
  r_ecl <- rot %*% r_pf
  v_ecl <- rot %*% v_pf
  
  return(c(as.numeric(r_ecl), as.numeric(v_ecl)))
}

# -------------------------------------------------------------------
# Acceleration computation: bodies positions -> accelerations (m/s^2)
# positions: Nx3 matrix (rows = bodies)
# masses: numeric vector of length N
# -------------------------------------------------------------------
calculate_accelerations <- function(positions, masses) {
  N <- nrow(positions)
  acc <- matrix(0, nrow = N, ncol = 3)
  eps <- 1e3           # softening (meters) to avoid singularities if extremely close
  for (i in 1:N) {
    for (j in 1:N) {
      if (i == j) next
      rvec <- positions[j, ] - positions[i, ]
      r2 <- sum(rvec^2) + eps^2
      r <- sqrt(r2)
      acc[i, ] <- acc[i, ] + (G * masses[j] / (r2 * r)) * rvec
    }
  }
  return(acc)
}

# -------------------------------------------------------------------
# Draw wireframe cube (bounding box) centered at origin with side length L (AU)
# -------------------------------------------------------------------
draw_wire_cube <- function(L_AU) {
  L <- L_AU
  # cube corners (centered)
  hl <- L/2
  corners <- expand.grid(x = c(-hl, hl), y = c(-hl, hl), z = c(-hl, hl))
  corners <- as.matrix(corners)
  # draw edges
  edges <- combn(1:8, 2)
  for (k in 1:ncol(edges)) {
    a <- edges[1,k]; b <- edges[2,k]
    da <- abs(corners[a,] - corners[b,])
    if (sum(da == 0) == 2) {
      segments3d(rbind(corners[a,], corners[b,]), add = TRUE, lwd = 1, col = "white")
    }
  }
}

# -------------------------------------------------------------------
# Main simulation wrapper
# -------------------------------------------------------------------
asteroid_id <- readline(prompt = "Enter asteroid name (e.g., 'Apophis', '433 Eros', 'Bennu', 'Ceres'): ")
total_duration_days <- 365 * 3    # 3 years (adjustable)
time_step_days <- 0.5             # 0.5 day timestep (adjustable)

tryCatch({
  cat("Fetching orbital data for", asteroid_id, "...\n")
  ast_elements <- get_asteroid_data(asteroid_id)
  
  # Provide Earth orbital elements in same simple structure (AU, degrees)
  earth_elements <- data.frame(
    name = c("e", "a", "i", "om", "w", "ma"),
    value = c(0.01671022, 1.00000011, 0.00005, -11.26064, (102.94719 - (-11.26064)), 100.46435),
    stringsAsFactors = FALSE
  )
  
  # Convert to state vectors (SI). Center mass is Sun.
  ast_state <- convert_elements_to_state(ast_elements, MASS["sun"])
  earth_state <- convert_elements_to_state(earth_elements, MASS["sun"])
  sun_state <- c(0,0,0, 0,0,0)   # put Sun at origin; its small motion due to Earth is neglected here
  
  # Build initial positions & velocities matrices (rows are bodies: Sun, Earth, Asteroid)
  states_pos <- rbind(
    sun_state[1:3],
    earth_state[1:3],
    ast_state[1:3]
  )
  states_vel <- rbind(
    sun_state[4:6],
    earth_state[4:6],
    ast_state[4:6]
  )
  body_masses <- MASS[c("sun","earth","asteroid")]
  
  # Simulation parameters
  dt <- time_step_days * DAY_S
  num_steps <- as.integer(round(total_duration_days / time_step_days))
  cat("Simulating", total_duration_days, "days in", num_steps, "steps (dt =", time_step_days, "day)\n")
  
  # Storage for trajectories (in AU)
  earth_path <- matrix(NA, nrow = num_steps, ncol = 3)
  ast_path   <- matrix(NA, nrow = num_steps, ncol = 3)
  
  # Initial accelerations
  acc <- calculate_accelerations(states_pos, body_masses)
  
  # Velocity-Verlet integrator
  for (step in 1:num_steps) {
    # positions <- positions + velocities*dt + 0.5*acc*dt^2
    states_pos <- states_pos + states_vel * dt + 0.5 * acc * (dt^2)
    
    # compute new accelerations at updated positions
    new_acc <- calculate_accelerations(states_pos, body_masses)
    
    # velocities <- velocities + 0.5*(acc + new_acc)*dt
    states_vel <- states_vel + 0.5 * (acc + new_acc) * dt
    
    # update acc for next iter
    acc <- new_acc
    
    # store (in AU)
    earth_path[step, ] <- states_pos[2, ] / AU
    ast_path[step, ]   <- states_pos[3, ] / AU
  }
  
  # Visualization
  cat("Rendering 3D scene and preparing animation...\n")
  clear3d()
  open3d(windowRect = c(50,50,850,850))
  aspect3d("iso")
  
  # Determine bounding box size (AU)
  all_coords <- rbind(earth_path, ast_path)
  max_extent <- max(abs(all_coords), na.rm = TRUE)
  box_len <- max(2.0, ceiling(max_extent * 1.25 * 10) / 10)  # at least 2 AU, rounded
  
  # Draw wire cube bounding box (centered)
  draw_wire_cube(box_len)
  
  # Plot paths
  lines3d(earth_path[,1], earth_path[,2], earth_path[,3], col = "cyan", lwd = 2)
  lines3d(ast_path[,1], ast_path[,2], ast_path[,3], col = "grey", lwd = 2)
  
  # Draw Sun, Earth & Asteroid initial spheres
  spheres3d(0, 0, 0, radius = 0.05 * box_len/2, col = "yellow") # Sun scaled with box
  earth_sphere <- spheres3d(earth_path[1,1], earth_path[1,2], earth_path[1,3],
                            radius = 0.03 * box_len/2, col = "blue")
  asteroid_sphere <- spheres3d(ast_path[1,1], ast_path[1,2], ast_path[1,3],
                               radius = 0.02 * box_len/2, col = "red")
  
  title3d(main = paste("Perturbed Orbit of", sub("^\\s*\\d+\\s+", "", asteroid_id)),
          xlab = "", ylab = "", zlab = "")
  
  # Animation widget (each object gets its own vertices matrix)
  my_widget <- rglwidget() %>%
    playwidget(
      list(
        ageControl(births = 0, ages = 1:num_steps, objids = earth_sphere, vertices = earth_path),
        ageControl(births = 0, ages = 1:num_steps, objids = asteroid_sphere, vertices = ast_path)
      ),
      start = 1, stop = num_steps, rate = max(1, num_steps / 20),
      components = c("Reverse", "Play", "Slower", "Faster", "Reset", "Slider", "Label"),
      loop = TRUE
    )
  
  htmlwidgets::saveWidget(my_widget, file = "perturbed_orbit_fixed.html", selfcontained = TRUE, background = "black")
  browseURL("perturbed_orbit_fixed.html")
  cat("\n✨ Animation saved to 'perturbed_orbit_fixed.html' and opened in your browser.\n")
  
}, error = function(e) {
  message("❌ Error: ", e$message)
})
