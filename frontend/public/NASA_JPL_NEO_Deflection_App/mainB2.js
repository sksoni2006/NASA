document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("simulation-form");
    const plotOutput = document.getElementById("plot-output");
    const plotInfo = document.getElementById("plot-info");
    const loader = document.getElementById("plot-loader");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        plotInfo.style.display = 'none';
        plotOutput.innerHTML = '';
        loader.style.display = 'block';

        // 1. Get user inputs
        const spkId = document.getElementById("spk-id").value;
        const apiKey = document.getElementById("api-key").value;
        const craftMass = parseFloat(document.getElementById("craft-mass").value); // kg
        const craftVel = parseFloat(document.getElementById("craft-vel").value); // m/s
        const astDensity = parseFloat(document.getElementById("ast-density").value); // kg/m^3
        const beta = parseFloat(document.getElementById("beta").value);
        const directionMode = document.getElementById("direction-mode").value;

        try {
            // 2. Fetch Asteroid Data from NASA API
            const url = `https://api.nasa.gov/neo/rest/v1/neo/${spkId}?api_key=${apiKey}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // 3. Extract and Process Data
            const orbitalData = data.orbital_data;
            const diamMeters = (parseFloat(data.estimated_diameter.meters.estimated_diameter_max) + parseFloat(data.estimated_diameter.meters.estimated_diameter_min)) / 2;
            const astMass = (4 / 3) * Math.PI * Math.pow(diamMeters / 2, 3) * astDensity;

            const deg2rad = Math.PI / 180;
            const ecc = parseFloat(orbitalData.eccentricity);
            const ma = parseFloat(orbitalData.mean_anomaly) * deg2rad;

            // 4. Perform Orbital Calculations
            // Solve Kepler's equation M = E - e*sin(E) for Eccentric Anomaly (E) using Newton-Raphson
            let E = ma; // Initial guess
            for (let i = 0; i < 7; i++) { // Iterate a few times for convergence
                E = E - (E - ecc * Math.sin(E) - ma) / (1 - ecc * Math.cos(E));
            }

            // Calculate True Anomaly (nu)
            const nu = 2 * Math.atan2(Math.sqrt(1 + ecc) * Math.sin(E / 2), Math.sqrt(1 - ecc) * Math.cos(E / 2));
            
            const auToKm = 149597870.7;
            const orbit = {
                a: parseFloat(orbitalData.semi_major_axis) * auToKm, // km
                ecc: ecc,
                inc: parseFloat(orbitalData.inclination) * deg2rad,
                raan: parseFloat(orbitalData.ascending_node_longitude) * deg2rad,
                argp: parseFloat(orbitalData.perihelion_argument) * deg2rad,
                nu: nu,
                attractor: 1.32712440018e11 // Sun's Gravitational Parameter (km^3/s^2)
            };
            
            // Convert orbital elements to state vectors [r, v]
            const [r_vec, v_vec] = elementsToStateVectors(orbit);

            // Calculate delta-v from kinetic impact
            const v_hat = v_vec.map(v => v / Math.sqrt(v_vec.reduce((acc, val) => acc + val*val, 0)));
            const r_hat = r_vec.map(r => r / Math.sqrt(r_vec.reduce((acc, val) => acc + val*val, 0)));
            
            let deltaV_vec;
            const deltaVMagnitude = (beta * craftMass * (craftVel / 1000)) / astMass; // km/s

            if (directionMode === '1') {
                deltaV_vec = v_hat.map(v => v * deltaVMagnitude);
            } else if (directionMode === '2') {
                deltaV_vec = v_hat.map(v => v * -deltaVMagnitude);
            } else {
                deltaV_vec = r_hat.map(r => r * deltaVMagnitude);
            }

            const v_vec_new = [v_vec[0] + deltaV_vec[0], v_vec[1] + deltaV_vec[1], v_vec[2] + deltaV_vec[2]];
            
            const finalOrbit = stateVectorsToElements({ r: r_vec, v: v_vec_new, attractor: orbit.attractor });
            
            // Propagate orbits for plotting
            const originalPath = propagateOrbit(orbit);
            const finalPath = propagateOrbit(finalOrbit);
            const earthOrbit = getEarthOrbit(orbitalData.epoch_osculation);

            // 5. Plotting
            plotOrbits(data.name, originalPath, finalPath, earthOrbit);

        } catch (error) {
            plotInfo.textContent = `Error: ${error.message}. Please check the SPK-ID and API Key.`;
            plotInfo.style.display = 'block';
        } finally {
            loader.style.display = 'none';
        }
    });

    // --- Helper Functions for Orbital Mechanics ---

    function elementsToStateVectors(elements) {
        const { a, ecc, inc, raan, argp, nu, attractor } = elements;
        const p = a * (1 - ecc * ecc);
        const r_norm = p / (1 + ecc * Math.cos(nu));

        // Position and velocity in the perifocal frame
        const r_pqw = [r_norm * Math.cos(nu), r_norm * Math.sin(nu), 0];
        const v_pqw = [-Math.sqrt(attractor / p) * Math.sin(nu), Math.sqrt(attractor / p) * (ecc + Math.cos(nu)), 0];

        // Rotation matrices to transform to the ecliptic frame
        const R_raan = [
            [Math.cos(raan), -Math.sin(raan), 0],
            [Math.sin(raan), Math.cos(raan), 0],
            [0, 0, 1]
        ];
        const R_inc = [
            [1, 0, 0],
            [0, Math.cos(inc), -Math.sin(inc)],
            [0, Math.sin(inc), Math.cos(inc)]
        ];
        const R_argp = [
            [Math.cos(argp), -Math.sin(argp), 0],
            [Math.sin(argp), Math.cos(argp), 0],
            [0, 0, 1]
        ];

        // Combine rotations (ZXZ rotation)
        const R_argp_inc = multiplyMatrix(R_inc, R_argp);
        const R_total = multiplyMatrix(R_raan, R_argp_inc);

        // Transpose for vector transformation
        const R_transpose = transposeMatrix(R_total);

        const r_vec = multiplyMatrixVector(R_transpose, r_pqw);
        const v_vec = multiplyMatrixVector(R_transpose, v_pqw);

        return [r_vec, v_vec];
    }
    
    function stateVectorsToElements(state) {
        const { r, v, attractor } = state;
        const r_norm = Math.sqrt(r.reduce((acc, val) => acc + val*val, 0));
        const v_norm_sq = v.reduce((acc, val) => acc + val*val, 0);

        const h_vec = crossProduct(r, v);
        const h_norm = Math.sqrt(h_vec.reduce((acc, val) => acc + val*val, 0));

        const n_vec = [-h_vec[1], h_vec[0], 0];
        const n_norm = Math.sqrt(n_vec.reduce((acc, val) => acc + val*val, 0));

        const e_vec = crossProduct(v, h_vec).map((val, i) => val / attractor - r[i] / r_norm);
        const ecc = Math.sqrt(e_vec.reduce((acc, val) => acc + val*val, 0));

        const a = 1 / (2 / r_norm - v_norm_sq / attractor);
        const inc = Math.acos(h_vec[2] / h_norm);
        const raan = Math.atan2(n_vec[1], n_vec[0]);
        const argp = Math.acos(dotProduct(n_vec, e_vec) / (n_norm * ecc));
        if (e_vec[2] < 0) {
            argp = 2 * Math.PI - argp;
        }
        const nu = Math.acos(dotProduct(e_vec, r) / (ecc * r_norm));
        if (dotProduct(r, v) < 0) {
            nu = 2 * Math.PI - nu;
        }

        return { a, ecc, inc, raan, argp, nu, attractor };
    }

    function propagateOrbit(elements) {
        const path = { x: [], y: [], z: [] };
        const num_points = 360;
        for (let i = 0; i <= num_points; i++) {
            const M = (i / num_points) * 2 * Math.PI;
            let E = M;
            for (let j = 0; j < 7; j++) {
                E = E - (E - elements.ecc * Math.sin(E) - M) / (1 - elements.ecc * Math.cos(E));
            }
            const nu = 2 * Math.atan2(Math.sqrt(1 + elements.ecc) * Math.sin(E / 2), Math.sqrt(1 - elements.ecc) * Math.cos(E / 2));
            const [r_vec, ] = elementsToStateVectors({ ...elements, nu });
            path.x.push(r_vec[0]);
            path.y.push(r_vec[1]);
            path.z.push(r_vec[2]);
        }
        return path;
    }
    
    function getEarthOrbit(epochJd) {
        // Approximate Earth's orbit as circular in the ecliptic plane for visualization
        const earth_a = 149597870.7; // 1 AU in km
        const path = { x: [], y: [], z: [] };
        const num_points = 360;
        for (let i = 0; i <= num_points; i++) {
            const angle = (i / num_points) * 2 * Math.PI;
            path.x.push(earth_a * Math.cos(angle));
            path.y.push(earth_a * Math.sin(angle));
            path.z.push(0);
        }
        return path;
    }

    function plotOrbits(name, originalPath, finalPath, earthPath) {
        const traceSun = {
            x: [0], y: [0], z: [0],
            mode: 'markers',
            marker: { color: 'yellow', size: 10, symbol: 'circle' },
            name: 'Sun'
        };

        const traceEarthOrbit = {
            ...earthPath,
            mode: 'lines',
            line: { color: 'lightblue', width: 2 },
            name: 'Earth Orbit'
        };
        
        const traceOriginal = {
            ...originalPath,
            mode: 'lines',
            line: { color: 'red', width: 4, dash: 'dash' },
            name: `Original Orbit (${name})`
        };

        const traceFinal = {
            ...finalPath,
            mode: 'lines',
            line: { color: 'lime', width: 4 },
            name: `New Orbit (${name})`
        };

        const layout = {
            title: `Orbital Deflection of Asteroid ${name}`,
            showlegend: true,
            margin: { l: 0, r: 0, b: 0, t: 40 },
            scene: {
                xaxis: { title: 'X (km)', color: 'white', gridcolor: '#444' },
                yaxis: { title: 'Y (km)', color: 'white', gridcolor: '#444' },
                zaxis: { title: 'Z (km)', color: 'white', gridcolor: '#444' },
                aspectmode: 'data',
                camera: { eye: {x: 1.5, y: 1.5, z: 1.5} }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: 'white' }
        };

        Plotly.newPlot('plot-output', [traceSun, traceEarthOrbit, traceOriginal, traceFinal], layout);
    }
    
    // --- Matrix and Vector Math Helpers ---
    function multiplyMatrix(m1, m2) {
        const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    result[i][j] += m1[i][k] * m2[k][j];
                }
            }
        }
        return result;
    }
    
    function transposeMatrix(m) {
        return [[m[0][0], m[1][0], m[2][0]], [m[0][1], m[1][1], m[2][1]], [m[0][2], m[1][2], m[2][2]]];
    }

    function multiplyMatrixVector(m, v) {
        return [
            m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
            m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
            m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
        ];
    }
    
    function crossProduct(v1, v2) {
        return [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
    }
    
    function dotProduct(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
});