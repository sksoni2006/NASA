# 🌌 Meteor Madness - Asteroid Impact Simulation

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202024-blue)](https://spaceappschallenge.org)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green)](https://flask.palletsprojects.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.156.1-orange)](https://threejs.org/)

An interactive asteroid impact simulation and planetary defense analysis platform built for NASA Space Apps Challenge 2024. Explore the science of protecting Earth from asteroid impacts through immersive 3D visualization, real-time physics calculations, and comprehensive deflection analysis.

## 🚀 Features

### 🎯 Core Simulation
- **Real Physics Calculations**: Accurate impact modeling using validated scientific formulas
- **Interactive Parameters**: Adjust asteroid size, velocity, density, and impact angle
- **Comprehensive Analysis**: Energy release, crater formation, seismic effects, and environmental damage
- **Risk Assessment**: Automated risk level classification and mitigation recommendations

### 🌍 3D Visualization
- **Orbital Mechanics**: Interactive 3D asteroid orbits using Three.js
- **Impact Scenarios**: Real-time visualization of impact trajectories and effects
- **Earth Mapping**: 2D impact mapping with damage zones using Leaflet
- **Environmental Overlay**: Population density, elevation, and geological features

### 🛡️ Deflection Analysis
- **Multiple Methods**: Kinetic impactor, gravity tractor, and nuclear deflection
- **Success Probability**: Calculate deflection effectiveness and mission feasibility
- **Mission Planning**: Comprehensive mission timelines and resource requirements
- **Comparison Tools**: Side-by-side analysis of different mitigation strategies

### 📊 Data Integration
- **NASA NEO API**: Real asteroid data from NASA's Near Earth Object Program
- **USGS Data**: Environmental and geological datasets for impact analysis
- **Historical Events**: Analysis of past impact events (Tunguska, Chicxulub, etc.)
- **Real-time Updates**: Live data feeds for current asteroid tracking

## 🏗️ Architecture

```
meteor-madness/
├── backend/                 # Flask API server
│   ├── app.py              # Main application entry point
│   ├── config.py           # Configuration settings
│   ├── utils/              # Physics calculations and data processing
│   │   ├── physics_calc.py # Impact physics and crater modeling
│   │   ├── nasa_data.py    # NASA NEO API integration
│   │   ├── usgs_data.py    # USGS environmental data
│   │   └── mitigation.py   # Deflection scenario analysis
│   └── routes/             # API endpoints
│       ├── asteroid_routes.py
│       ├── impact_routes.py
│       └── mitigation_routes.py
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── services/       # API communication layer
│   │   ├── context/        # React context for state management
│   │   └── assets/         # Static assets and styles
│   └── public/             # Public assets
└── docs/                   # Documentation and presentation materials
```

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - Modern UI framework
- **Three.js** - 3D graphics and visualization
- **React Three Fiber** - React integration for Three.js
- **Leaflet** - Interactive mapping
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server

### Backend
- **Flask 2.3.3** - Python web framework
- **NumPy & SciPy** - Scientific computing
- **Pandas** - Data manipulation
- **GeoPandas** - Geographic data processing
- **Requests** - HTTP client for API calls

### Data Sources
- **NASA NEO API** - Asteroid orbital and physical data
- **USGS APIs** - Environmental and geological data
- **OpenStreetMap** - Base mapping data

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/meteor-madness.git
   cd meteor-madness
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env and add your NASA API key
   ```

4. **Start the backend server**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### 1. Impact Simulation
- Navigate to the **Simulation** page
- Adjust asteroid parameters using the sliders
- Set impact location coordinates (optional)
- Click **Run Simulation** to calculate impact effects
- View detailed results including energy release, crater size, and damage zones

### 2. 3D Visualization
- Go to the **3D Visualization** page
- Interact with the 3D scene using mouse controls:
  - Left click + drag: Rotate view
  - Right click + drag: Pan view
  - Scroll: Zoom in/out
- Observe asteroid orbits and impact trajectories

### 3. Impact Mapping
- Visit the **Impact Map** page
- Click anywhere on the map to set impact location
- View damage zones overlaid on the Earth's surface
- Analyze population and environmental effects

### 4. Deflection Analysis
- Access the **Mitigation** page
- Select a deflection method (kinetic impactor, gravity tractor, or nuclear)
- Set time to impact and run analysis
- Compare different methods and view success probabilities

## 🔬 Scientific Models

### Impact Physics
- **Kinetic Energy**: E = ½mv²
- **TNT Equivalent**: E_TNT = E / 4.184×10⁹ J
- **Crater Scaling**: D = 1.161 × (E_TNT)^0.25 × (sin θ)^0.33
- **Seismic Magnitude**: M = (2/3) × log₁₀(E) - 3.2

### Deflection Methods
- **Kinetic Impactor**: Momentum transfer through high-speed collision
- **Gravity Tractor**: Gravitational attraction for precise trajectory modification
- **Nuclear Deflection**: Energy release for significant velocity changes

### Environmental Effects
- **Tsunami Modeling**: Wave height and coastal impact analysis
- **Atmospheric Effects**: Fireball radius and thermal radiation
- **Seismic Amplification**: Ground motion and structural damage

## 📊 API Documentation

### Impact Simulation
```http
POST /api/impact/simulate
Content-Type: application/json

{
  "diameter_m": 100,
  "velocity_km_s": 17,
  "density_kg_m3": 3000,
  "impact_angle_deg": 45,
  "impact_lat": 40.7128,
  "impact_lon": -74.0060
}
```

### Asteroid Data
```http
GET /api/asteroid/list?source=sample&limit=10
GET /api/asteroid/{asteroid_id}
```

### Deflection Analysis
```http
POST /api/mitigation/deflect
Content-Type: application/json

{
  "asteroid_data": {...},
  "deflection_method": "kinetic_impactor",
  "deflection_parameters": {...},
  "time_to_impact_days": 365
}
```

## 🎯 NASA Space Apps Challenge

This project was developed for the **NASA Space Apps Challenge 2024**, addressing the challenge of **Planetary Defense**. The goal is to make asteroid impact science accessible and help educate the public about the importance of planetary defense research.

### Challenge Objectives
- ✅ Interactive asteroid impact simulation
- ✅ Real-time physics calculations
- ✅ 3D visualization of orbital mechanics
- ✅ Deflection strategy analysis
- ✅ Integration with NASA data sources
- ✅ Educational and engaging user interface

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write tests for new features
- Update documentation as needed
- Follow the existing code style and patterns

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This simulation is for **educational and demonstration purposes only**. The calculations and models used are simplified versions of complex scientific processes. For actual planetary defense planning and decision-making, consult with qualified experts and use validated scientific models and data sources.

## 🙏 Acknowledgments

- **NASA** for providing asteroid data through the NEO API
- **USGS** for environmental and geological datasets
- **Space Apps Challenge** for organizing this inspiring event
- **Open Source Community** for the amazing tools and libraries
- **Scientific Community** for the research that makes this possible

## 📞 Contact

- **Project Repository**: [GitHub](https://github.com/your-username/meteor-madness)
- **NASA Space Apps**: [spaceappschallenge.org](https://spaceappschallenge.org)
- **Issues**: [GitHub Issues](https://github.com/your-username/meteor-madness/issues)

---

**Built with ❤️ for NASA Space Apps Challenge 2024**

*Protecting Earth, one simulation at a time* 🛡️🌍
