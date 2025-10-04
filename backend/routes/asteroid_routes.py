"""
Asteroid-related API routes
Handles fetching and managing asteroid data from NASA and other sources
"""

from flask import Blueprint, request, jsonify
from utils.nasa_data import (
    fetch_neo_data, get_asteroid_by_id, parse_asteroid_data, 
    get_sample_asteroids, get_asteroid_impact_scenario
)
from utils.usgs_data import get_impact_environmental_data
from utils.physics_calc import compute_impact_metrics

asteroid_bp = Blueprint('asteroid', __name__)

@asteroid_bp.route('/list', methods=['GET'])
def list_asteroids():
    """
    Get list of asteroids from NASA NEO API or sample data.
    
    Query parameters:
    - source: 'nasa' or 'sample' (default: 'sample')
    - start_date: Start date for NASA data (YYYY-MM-DD)
    - end_date: End date for NASA data (YYYY-MM-DD)
    - limit: Maximum number of asteroids to return
    """
    
    try:
        source = request.args.get('source', 'sample')
        limit = int(request.args.get('limit', 50))
        
        if source == 'nasa':
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            
            # Fetch from NASA API
            neo_data = fetch_neo_data(start_date=start_date, end_date=end_date)
            asteroids = parse_asteroid_data(neo_data)
            
            # Limit results
            asteroids = asteroids[:limit]
            
        else:
            # Use sample data
            asteroids = get_sample_asteroids()
        
        return jsonify({
            'success': True,
            'count': len(asteroids),
            'source': source,
            'asteroids': asteroids
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asteroid_bp.route('/<asteroid_id>', methods=['GET'])
def get_asteroid_details(asteroid_id):
    """
    Get detailed information about a specific asteroid.
    
    Path parameters:
    - asteroid_id: NASA asteroid ID or sample asteroid ID
    """
    
    try:
        # Try to get from NASA API first
        try:
            asteroid_data = get_asteroid_by_id(asteroid_id)
            parsed_data = parse_asteroid_data({'near_earth_objects': {'2024-01-01': [asteroid_data]}})
            asteroid = parsed_data[0] if parsed_data else None
        except:
            # Fall back to sample data
            sample_asteroids = get_sample_asteroids()
            asteroid = next((a for a in sample_asteroids if a['id'] == asteroid_id), None)
        
        if not asteroid:
            return jsonify({
                'success': False,
                'error': f'Asteroid {asteroid_id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'asteroid': asteroid
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asteroid_bp.route('/<asteroid_id>/impact-scenario', methods=['POST'])
def create_impact_scenario(asteroid_id):
    """
    Create an impact scenario for a specific asteroid.
    
    Path parameters:
    - asteroid_id: NASA asteroid ID or sample asteroid ID
    
    JSON body:
    - impact_lat: Impact latitude (optional)
    - impact_lon: Impact longitude (optional)
    - impact_angle_deg: Impact angle in degrees (optional)
    """
    
    try:
        # Get asteroid data
        try:
            asteroid_data = get_asteroid_by_id(asteroid_id)
            parsed_data = parse_asteroid_data({'near_earth_objects': {'2024-01-01': [asteroid_data]}})
            asteroid = parsed_data[0] if parsed_data else None
        except:
            sample_asteroids = get_sample_asteroids()
            asteroid = next((a for a in sample_asteroids if a['id'] == asteroid_id), None)
        
        if not asteroid:
            return jsonify({
                'success': False,
                'error': f'Asteroid {asteroid_id} not found'
            }), 404
        
        # Get impact parameters from request
        data = request.get_json() or {}
        impact_lat = data.get('impact_lat')
        impact_lon = data.get('impact_lon')
        impact_angle_deg = data.get('impact_angle_deg')
        
        # Create impact scenario
        scenario_params = get_asteroid_impact_scenario(
            asteroid, 
            impact_lat=impact_lat, 
            impact_lon=impact_lon
        )
        
        if impact_angle_deg is not None:
            scenario_params['impact_angle_deg'] = impact_angle_deg
        
        # Compute impact metrics
        impact_metrics = compute_impact_metrics(
            diameter_m=scenario_params['diameter_m'],
            velocity_km_s=scenario_params['velocity_km_s'],
            density_kg_m3=scenario_params['density_kg_m3'],
            impact_angle_deg=scenario_params['impact_angle_deg'],
            impact_lat=scenario_params['impact_lat'],
            impact_lon=scenario_params['impact_lon']
        )
        
        # Get environmental data if location is specified
        environmental_data = None
        if impact_lat is not None and impact_lon is not None:
            try:
                environmental_data = get_impact_environmental_data(impact_lat, impact_lon)
            except:
                pass  # Environmental data is optional
        
        return jsonify({
            'success': True,
            'asteroid': asteroid,
            'scenario_parameters': scenario_params,
            'impact_metrics': impact_metrics,
            'environmental_data': environmental_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asteroid_bp.route('/search', methods=['GET'])
def search_asteroids():
    """
    Search asteroids by various criteria.
    
    Query parameters:
    - name: Search by asteroid name (partial match)
    - min_diameter: Minimum diameter in meters
    - max_diameter: Maximum diameter in meters
    - hazardous: Filter by potentially hazardous status (true/false)
    - min_velocity: Minimum velocity in km/s
    - max_velocity: Maximum velocity in km/s
    """
    
    try:
        # Get search criteria
        name_filter = request.args.get('name', '').lower()
        min_diameter = request.args.get('min_diameter', type=float)
        max_diameter = request.args.get('max_diameter', type=float)
        hazardous_filter = request.args.get('hazardous', type=bool)
        min_velocity = request.args.get('min_velocity', type=float)
        max_velocity = request.args.get('max_velocity', type=float)
        
        # Get sample asteroids (in a real app, you'd search the database)
        asteroids = get_sample_asteroids()
        
        # Apply filters
        filtered_asteroids = []
        for asteroid in asteroids:
            # Name filter
            if name_filter and name_filter not in asteroid.get('name', '').lower():
                continue
            
            # Diameter filter
            diameter = asteroid.get('diameter_avg_m', 0)
            if min_diameter is not None and diameter < min_diameter:
                continue
            if max_diameter is not None and diameter > max_diameter:
                continue
            
            # Hazardous filter
            if hazardous_filter is not None and asteroid.get('is_potentially_hazardous') != hazardous_filter:
                continue
            
            # Velocity filter
            velocity = asteroid.get('velocity_km_s', 0)
            if min_velocity is not None and velocity < min_velocity:
                continue
            if max_velocity is not None and velocity > max_velocity:
                continue
            
            filtered_asteroids.append(asteroid)
        
        return jsonify({
            'success': True,
            'count': len(filtered_asteroids),
            'filters_applied': {
                'name': name_filter,
                'min_diameter': min_diameter,
                'max_diameter': max_diameter,
                'hazardous': hazardous_filter,
                'min_velocity': min_velocity,
                'max_velocity': max_velocity
            },
            'asteroids': filtered_asteroids
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@asteroid_bp.route('/stats', methods=['GET'])
def get_asteroid_stats():
    """
    Get statistics about available asteroids.
    """
    
    try:
        asteroids = get_sample_asteroids()
        
        if not asteroids:
            return jsonify({
                'success': True,
                'stats': {
                    'total_count': 0,
                    'diameter_stats': {},
                    'velocity_stats': {},
                    'hazardous_count': 0
                }
            })
        
        # Calculate statistics
        diameters = [a.get('diameter_avg_m', 0) for a in asteroids if a.get('diameter_avg_m')]
        velocities = [a.get('velocity_km_s', 0) for a in asteroids if a.get('velocity_km_s')]
        hazardous_count = sum(1 for a in asteroids if a.get('is_potentially_hazardous'))
        
        stats = {
            'total_count': len(asteroids),
            'diameter_stats': {
                'min': min(diameters) if diameters else 0,
                'max': max(diameters) if diameters else 0,
                'avg': sum(diameters) / len(diameters) if diameters else 0
            },
            'velocity_stats': {
                'min': min(velocities) if velocities else 0,
                'max': max(velocities) if velocities else 0,
                'avg': sum(velocities) / len(velocities) if velocities else 0
            },
            'hazardous_count': hazardous_count,
            'hazardous_percentage': (hazardous_count / len(asteroids)) * 100 if asteroids else 0
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
