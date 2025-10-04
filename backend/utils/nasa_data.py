"""
NASA NEO (Near Earth Object) API integration
Fetches real asteroid data from NASA's database
"""

import requests
import json
from datetime import datetime, timedelta
from config import Config

class NASADataError(Exception):
    """Custom exception for NASA API errors"""
    pass

def fetch_neo_data(api_key=None, start_date=None, end_date=None):
    """
    Fetch Near Earth Objects from NASA API.
    
    Args:
        api_key: NASA API key (uses config if not provided)
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
    
    Returns:
        dict: NEO data from NASA API
    """
    
    if api_key is None:
        api_key = Config.NASA_API_KEY
    
    if not api_key:
        raise NASADataError("NASA API key not configured")
    
    # Default to next 7 days if dates not provided
    if start_date is None:
        start_date = datetime.now().strftime('%Y-%m-%d')
    if end_date is None:
        end_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    
    url = "https://api.nasa.gov/neo/rest/v1/feed"
    params = {
        'start_date': start_date,
        'end_date': end_date,
        'api_key': api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise NASADataError(f"Failed to fetch NEO data: {str(e)}")

def get_asteroid_by_id(asteroid_id, api_key=None):
    """
    Get detailed information about a specific asteroid by its ID.
    
    Args:
        asteroid_id: NASA asteroid ID
        api_key: NASA API key (uses config if not provided)
    
    Returns:
        dict: Detailed asteroid data
    """
    
    if api_key is None:
        api_key = Config.NASA_API_KEY
    
    if not api_key:
        raise NASADataError("NASA API key not configured")
    
    url = f"https://api.nasa.gov/neo/rest/v1/neo/{asteroid_id}"
    params = {'api_key': api_key}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise NASADataError(f"Failed to fetch asteroid {asteroid_id}: {str(e)}")

def parse_asteroid_data(neo_data):
    """
    Parse NASA NEO data into standardized format for our application.
    
    Args:
        neo_data: Raw NASA NEO data
    
    Returns:
        list: List of parsed asteroid objects
    """
    
    asteroids = []
    
    # NASA API returns data organized by date
    for date, date_data in neo_data.get('near_earth_objects', {}).items():
        for asteroid in date_data:
            parsed_asteroid = {
                'id': asteroid.get('id'),
                'name': asteroid.get('name'),
                'designation': asteroid.get('designation'),
                'diameter_min_m': asteroid.get('estimated_diameter', {}).get('meters', {}).get('estimated_diameter_min'),
                'diameter_max_m': asteroid.get('estimated_diameter', {}).get('meters', {}).get('estimated_diameter_max'),
                'diameter_avg_m': None,
                'is_potentially_hazardous': asteroid.get('is_potentially_hazardous_asteroid', False),
                'close_approach_data': [],
                'orbital_data': asteroid.get('orbital_data', {}),
                'absolute_magnitude': asteroid.get('absolute_magnitude_h'),
                'albedo': asteroid.get('albedo'),
                'density_kg_m3': None,  # Not provided by NASA API
                'velocity_km_s': None,  # Will be extracted from close approach data
            }
            
            # Calculate average diameter
            if parsed_asteroid['diameter_min_m'] and parsed_asteroid['diameter_max_m']:
                parsed_asteroid['diameter_avg_m'] = (
                    parsed_asteroid['diameter_min_m'] + parsed_asteroid['diameter_max_m']
                ) / 2.0
            
            # Extract close approach data
            for approach in asteroid.get('close_approach_data', []):
                approach_data = {
                    'date': approach.get('close_approach_date'),
                    'epoch_date': approach.get('epoch_date_close_approach'),
                    'relative_velocity_km_s': float(approach.get('relative_velocity', {}).get('kilometers_per_second', 0)),
                    'miss_distance_km': float(approach.get('miss_distance', {}).get('kilometers', 0)),
                    'orbiting_body': approach.get('orbiting_body'),
                    'velocity_km_s': float(approach.get('relative_velocity', {}).get('kilometers_per_second', 0))
                }
                parsed_asteroid['close_approach_data'].append(approach_data)
                
                # Use the first close approach velocity as default
                if parsed_asteroid['velocity_km_s'] is None:
                    parsed_asteroid['velocity_km_s'] = approach_data['velocity_km_s']
            
            # Estimate density if not available (typical asteroid density)
            if parsed_asteroid['density_kg_m3'] is None:
                parsed_asteroid['density_kg_m3'] = Config.DEFAULT_DENSITY
            
            asteroids.append(parsed_asteroid)
    
    return asteroids

def get_sample_asteroids():
    """
    Get a curated list of interesting asteroids for demonstration.
    
    Returns:
        list: Sample asteroid data
    """
    
    # Sample asteroids with known properties
    sample_asteroids = [
        {
            'id': '2000433',
            'name': 'Eros',
            'designation': '433 Eros',
            'diameter_avg_m': 16000,  # ~16 km
            'density_kg_m3': 2670,
            'velocity_km_s': 17.0,  # Typical impact velocity
            'is_potentially_hazardous': False,
            'description': 'First near-Earth asteroid discovered (1898)'
        },
        {
            'id': '20025143',
            'name': 'Itokawa',
            'designation': '25143 Itokawa',
            'diameter_avg_m': 330,  # ~330 m
            'density_kg_m3': 1950,
            'velocity_km_s': 12.0,
            'is_potentially_hazardous': False,
            'description': 'Visited by Hayabusa spacecraft'
        },
        {
            'id': '200101955',
            'name': 'Bennu',
            'designation': '101955 Bennu',
            'diameter_avg_m': 490,  # ~490 m
            'density_kg_m3': 1190,
            'velocity_km_s': 12.4,
            'is_potentially_hazardous': True,
            'description': 'Target of OSIRIS-REx mission'
        },
        {
            'id': '20099942',
            'name': 'Apophis',
            'designation': '99942 Apophis',
            'diameter_avg_m': 370,  # ~370 m
            'density_kg_m3': 2600,
            'velocity_km_s': 12.6,
            'is_potentially_hazardous': True,
            'description': 'Previously considered high impact risk'
        }
    ]
    
    return sample_asteroids

def get_asteroid_impact_scenario(asteroid_data, impact_lat=None, impact_lon=None):
    """
    Create an impact scenario from asteroid data.
    
    Args:
        asteroid_data: Parsed asteroid data
        impact_lat: Impact latitude (optional)
        impact_lon: Impact longitude (optional)
    
    Returns:
        dict: Impact scenario parameters
    """
    
    # Use average diameter or estimate from magnitude
    diameter_m = asteroid_data.get('diameter_avg_m')
    if diameter_m is None and asteroid_data.get('absolute_magnitude'):
        # Rough diameter estimation from absolute magnitude
        # This is a simplified relationship
        abs_mag = asteroid_data['absolute_magnitude']
        diameter_m = 10 ** (3.1236 - 0.5 * abs_mag)  # Very rough estimate
    
    if diameter_m is None:
        diameter_m = 100.0  # Default fallback
    
    return {
        'diameter_m': diameter_m,
        'velocity_km_s': asteroid_data.get('velocity_km_s', 17.0),
        'density_kg_m3': asteroid_data.get('density_kg_m3', Config.DEFAULT_DENSITY),
        'impact_angle_deg': Config.DEFAULT_IMPACT_ANGLE,
        'impact_lat': impact_lat,
        'impact_lon': impact_lon,
        'asteroid_name': asteroid_data.get('name', 'Unknown'),
        'asteroid_id': asteroid_data.get('id'),
        'is_potentially_hazardous': asteroid_data.get('is_potentially_hazardous', False)
    }
