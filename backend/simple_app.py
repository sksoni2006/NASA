"""
Simple Flask app for testing
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

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

@app.route('/api/impact/simulate', methods=['POST'])
def simulate_impact():
    """Simple impact simulation endpoint"""
    from flask import request
    
    data = request.get_json() or {}
    
    # Simple calculation
    diameter = data.get('diameter_m', 100)
    velocity = data.get('velocity_km_s', 17)
    
    # Basic physics calculation
    radius = diameter / 2.0
    volume = (4.0/3.0) * 3.14159 * (radius**3)
    mass = volume * 3000  # Assume 3000 kg/m³ density
    energy_j = 0.5 * mass * (velocity * 1000)**2  # Convert km/s to m/s
    energy_tnt_tons = energy_j / 4.184e9
    
    # Simple crater estimate
    crater_diameter_km = 1.161 * (energy_tnt_tons ** 0.25)
    
    return jsonify({
        "success": True,
        "impact_metrics": {
            "diameter_m": diameter,
            "velocity_km_s": velocity,
            "mass_kg": mass,
            "energy_joules": energy_j,
            "energy_tnt_tons": energy_tnt_tons,
            "crater_diameter_km": crater_diameter_km,
            "risk_level": "high" if energy_tnt_tons > 1000 else "moderate" if energy_tnt_tons > 100 else "low"
        }
    })

@app.route('/api/asteroid/list', methods=['GET'])
def get_asteroid_list():
    """Get list of sample asteroids"""
    sample_asteroids = [
        {
            'id': '2000433',
            'name': 'Eros',
            'designation': '433 Eros',
            'diameter_avg_m': 16000,
            'density_kg_m3': 2670,
            'velocity_km_s': 17.0,
            'is_potentially_hazardous': False,
            'description': 'First near-Earth asteroid discovered (1898)'
        },
        {
            'id': '20025143',
            'name': 'Itokawa',
            'designation': '25143 Itokawa',
            'diameter_avg_m': 330,
            'density_kg_m3': 1950,
            'velocity_km_s': 12.0,
            'is_potentially_hazardous': False,
            'description': 'Visited by Hayabusa spacecraft'
        },
        {
            'id': '200101955',
            'name': 'Bennu',
            'designation': '101955 Bennu',
            'diameter_avg_m': 490,
            'density_kg_m3': 1190,
            'velocity_km_s': 12.4,
            'is_potentially_hazardous': True,
            'description': 'Target of OSIRIS-REx mission'
        },
        {
            'id': '20099942',
            'name': 'Apophis',
            'designation': '99942 Apophis',
            'diameter_avg_m': 370,
            'density_kg_m3': 2600,
            'velocity_km_s': 12.6,
            'is_potentially_hazardous': True,
            'description': 'Previously considered high impact risk'
        }
    ]
    
    return jsonify({
        'success': True,
        'count': len(sample_asteroids),
        'source': 'sample',
        'asteroids': sample_asteroids
    })

@app.route('/api/asteroid/stats', methods=['GET'])
def get_asteroid_stats():
    """Get asteroid statistics"""
    return jsonify({
        'success': True,
        'stats': {
            'total_count': 4,
            'diameter_stats': {
                'min': 330,
                'max': 16000,
                'avg': 4297.5
            },
            'velocity_stats': {
                'min': 12.0,
                'max': 17.0,
                'avg': 13.5
            },
            'hazardous_count': 2,
            'hazardous_percentage': 50.0
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🌌 Meteor Madness Backend starting on port {port}")
    print(f"🔬 Debug mode: {debug}")
    print(f"🚀 NASA API Key: {'✅ Configured' if os.getenv('NASA_API_KEY') else '❌ Missing'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
