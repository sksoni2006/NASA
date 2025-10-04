"""
Meteor Madness - Main Flask Backend
NASA Space Apps Challenge 2024

Handles asteroid impact simulation, physics calculations, and API endpoints.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Import our custom modules
from utils.physics_calc import compute_impact_metrics, compute_mitigation_scenario
from utils.nasa_data import fetch_neo_data, get_asteroid_by_id
from utils.usgs_data import get_elevation_data, get_seismic_zones
from routes.asteroid_routes import asteroid_bp
from routes.impact_routes import impact_bp
from routes.mitigation_routes import mitigation_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Register blueprints
app.register_blueprint(asteroid_bp, url_prefix='/api/asteroid')
app.register_blueprint(impact_bp, url_prefix='/api/impact')
app.register_blueprint(mitigation_bp, url_prefix='/api/mitigation')

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Meteor Madness API is running",
        "version": "1.0.0"
    })

@app.route('/api/status')
def api_status():
    """API status with available endpoints"""
    return jsonify({
        "status": "operational",
        "endpoints": {
            "asteroid": "/api/asteroid/*",
            "impact": "/api/impact/*", 
            "mitigation": "/api/mitigation/*"
        },
        "nasa_api_key": "configured" if os.getenv('NASA_API_KEY') else "missing"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🌌 Meteor Madness Backend starting on port {port}")
    print(f"🔬 Debug mode: {debug}")
    print(f"🚀 NASA API Key: {'✅ Configured' if os.getenv('NASA_API_KEY') else '❌ Missing'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)