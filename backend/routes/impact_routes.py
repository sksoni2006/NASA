"""
Impact simulation API routes
Handles asteroid impact calculations and environmental analysis
"""

from flask import Blueprint, request, jsonify
from utils.physics_calc import compute_impact_metrics
from utils.usgs_data import get_impact_environmental_data, get_elevation_data, get_seismic_zones

impact_bp = Blueprint('impact', __name__)

@impact_bp.route('/simulate', methods=['POST'])
def simulate_impact():
    """
    Simulate asteroid impact with comprehensive analysis.
    
    JSON body:
    - diameter_m: Asteroid diameter in meters
    - velocity_km_s: Impact velocity in km/s
    - density_kg_m3: Asteroid density in kg/m³ (optional)
    - impact_angle_deg: Impact angle in degrees (optional)
    - impact_lat: Impact latitude (optional)
    - impact_lon: Impact longitude (optional)
    - include_environmental: Include environmental analysis (optional, default: true)
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        # Extract and validate parameters
        diameter_m = data.get('diameter_m')
        velocity_km_s = data.get('velocity_km_s')
        
        if diameter_m is None or velocity_km_s is None:
            return jsonify({
                'success': False,
                'error': 'diameter_m and velocity_km_s are required'
            }), 400
        
        # Optional parameters with defaults
        density_kg_m3 = data.get('density_kg_m3')
        impact_angle_deg = data.get('impact_angle_deg')
        impact_lat = data.get('impact_lat')
        impact_lon = data.get('impact_lon')
        include_environmental = data.get('include_environmental', True)
        
        # Compute impact metrics
        impact_metrics = compute_impact_metrics(
            diameter_m=diameter_m,
            velocity_km_s=velocity_km_s,
            density_kg_m3=density_kg_m3,
            impact_angle_deg=impact_angle_deg,
            impact_lat=impact_lat,
            impact_lon=impact_lon
        )
        
        # Get environmental data if location is specified and requested
        environmental_data = None
        if include_environmental and impact_lat is not None and impact_lon is not None:
            try:
                environmental_data = get_impact_environmental_data(impact_lat, impact_lon)
            except Exception as e:
                # Environmental data is optional, log error but continue
                print(f"Warning: Failed to fetch environmental data: {e}")
        
        return jsonify({
            'success': True,
            'impact_metrics': impact_metrics,
            'environmental_data': environmental_data,
            'simulation_parameters': {
                'diameter_m': diameter_m,
                'velocity_km_s': velocity_km_s,
                'density_kg_m3': density_kg_m3,
                'impact_angle_deg': impact_angle_deg,
                'impact_lat': impact_lat,
                'impact_lon': impact_lon
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@impact_bp.route('/batch-simulate', methods=['POST'])
def batch_simulate_impacts():
    """
    Simulate multiple impact scenarios in batch.
    
    JSON body:
    - scenarios: Array of impact scenarios, each with:
      - diameter_m: Asteroid diameter in meters
      - velocity_km_s: Impact velocity in km/s
      - density_kg_m3: Asteroid density in kg/m³ (optional)
      - impact_angle_deg: Impact angle in degrees (optional)
      - impact_lat: Impact latitude (optional)
      - impact_lon: Impact longitude (optional)
      - scenario_name: Name for this scenario (optional)
    """
    
    try:
        data = request.get_json()
        if not data or 'scenarios' not in data:
            return jsonify({
                'success': False,
                'error': 'scenarios array required in JSON body'
            }), 400
        
        scenarios = data['scenarios']
        if not isinstance(scenarios, list) or len(scenarios) == 0:
            return jsonify({
                'success': False,
                'error': 'scenarios must be a non-empty array'
            }), 400
        
        results = []
        
        for i, scenario in enumerate(scenarios):
            try:
                # Validate required parameters
                if 'diameter_m' not in scenario or 'velocity_km_s' not in scenario:
                    results.append({
                        'scenario_index': i,
                        'scenario_name': scenario.get('scenario_name', f'Scenario {i+1}'),
                        'success': False,
                        'error': 'diameter_m and velocity_km_s are required'
                    })
                    continue
                
                # Compute impact metrics
                impact_metrics = compute_impact_metrics(
                    diameter_m=scenario['diameter_m'],
                    velocity_km_s=scenario['velocity_km_s'],
                    density_kg_m3=scenario.get('density_kg_m3'),
                    impact_angle_deg=scenario.get('impact_angle_deg'),
                    impact_lat=scenario.get('impact_lat'),
                    impact_lon=scenario.get('impact_lon')
                )
                
                results.append({
                    'scenario_index': i,
                    'scenario_name': scenario.get('scenario_name', f'Scenario {i+1}'),
                    'success': True,
                    'impact_metrics': impact_metrics,
                    'simulation_parameters': scenario
                })
                
            except Exception as e:
                results.append({
                    'scenario_index': i,
                    'scenario_name': scenario.get('scenario_name', f'Scenario {i+1}'),
                    'success': False,
                    'error': str(e)
                })
        
        # Calculate summary statistics
        successful_simulations = [r for r in results if r['success']]
        failed_simulations = [r for r in results if not r['success']]
        
        summary = {
            'total_scenarios': len(scenarios),
            'successful_simulations': len(successful_simulations),
            'failed_simulations': len(failed_simulations),
            'success_rate': len(successful_simulations) / len(scenarios) * 100
        }
        
        return jsonify({
            'success': True,
            'summary': summary,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@impact_bp.route('/compare', methods=['POST'])
def compare_impacts():
    """
    Compare multiple impact scenarios side by side.
    
    JSON body:
    - scenarios: Array of impact scenarios (same format as batch-simulate)
    - comparison_metrics: Array of metrics to compare (optional)
    """
    
    try:
        data = request.get_json()
        if not data or 'scenarios' not in data:
            return jsonify({
                'success': False,
                'error': 'scenarios array required in JSON body'
            }), 400
        
        scenarios = data['scenarios']
        comparison_metrics = data.get('comparison_metrics', [
            'energy_tnt_tons',
            'crater_diameter_km',
            'seismic_magnitude',
            'severe_damage_radius_km',
            'risk_level'
        ])
        
        # Run batch simulation
        batch_response = batch_simulate_impacts()
        batch_data = batch_response.get_json()
        
        if not batch_data['success']:
            return jsonify(batch_data), 500
        
        # Extract successful results
        successful_results = [r for r in batch_data['results'] if r['success']]
        
        if len(successful_results) < 2:
            return jsonify({
                'success': False,
                'error': 'At least 2 successful simulations required for comparison'
            }), 400
        
        # Create comparison matrix
        comparison_matrix = {}
        
        for metric in comparison_metrics:
            comparison_matrix[metric] = {}
            
            for result in successful_results:
                scenario_name = result['scenario_name']
                impact_metrics = result['impact_metrics']
                
                if metric in impact_metrics:
                    comparison_matrix[metric][scenario_name] = impact_metrics[metric]
                else:
                    comparison_matrix[metric][scenario_name] = None
        
        # Find best and worst scenarios for each metric
        rankings = {}
        
        for metric, values in comparison_matrix.items():
            # Filter out None values
            valid_values = {k: v for k, v in values.items() if v is not None}
            
            if valid_values:
                # Sort by value (higher is worse for most impact metrics)
                sorted_scenarios = sorted(valid_values.items(), key=lambda x: x[1], reverse=True)
                
                rankings[metric] = {
                    'worst': sorted_scenarios[0] if sorted_scenarios else None,
                    'best': sorted_scenarios[-1] if sorted_scenarios else None,
                    'all_ranked': sorted_scenarios
                }
        
        return jsonify({
            'success': True,
            'comparison_matrix': comparison_matrix,
            'rankings': rankings,
            'summary': batch_data['summary'],
            'scenarios': successful_results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@impact_bp.route('/environmental-analysis', methods=['POST'])
def environmental_analysis():
    """
    Perform detailed environmental analysis for an impact location.
    
    JSON body:
    - impact_lat: Impact latitude
    - impact_lon: Impact longitude
    - radius_km: Analysis radius in kilometers (optional, default: 100)
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        impact_lat = data.get('impact_lat')
        impact_lon = data.get('impact_lon')
        radius_km = data.get('radius_km', 100.0)
        
        if impact_lat is None or impact_lon is None:
            return jsonify({
                'success': False,
                'error': 'impact_lat and impact_lon are required'
            }), 400
        
        # Get comprehensive environmental data
        environmental_data = get_impact_environmental_data(impact_lat, impact_lon, radius_km)
        
        return jsonify({
            'success': True,
            'location': {
                'latitude': impact_lat,
                'longitude': impact_lon,
                'radius_km': radius_km
            },
            'environmental_data': environmental_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@impact_bp.route('/risk-assessment', methods=['POST'])
def risk_assessment():
    """
    Perform comprehensive risk assessment for an impact scenario.
    
    JSON body:
    - diameter_m: Asteroid diameter in meters
    - velocity_km_s: Impact velocity in km/s
    - density_kg_m3: Asteroid density in kg/m³ (optional)
    - impact_angle_deg: Impact angle in degrees (optional)
    - impact_lat: Impact latitude (optional)
    - impact_lon: Impact longitude (optional)
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        # Extract parameters
        diameter_m = data.get('diameter_m')
        velocity_km_s = data.get('velocity_km_s')
        
        if diameter_m is None or velocity_km_s is None:
            return jsonify({
                'success': False,
                'error': 'diameter_m and velocity_km_s are required'
            }), 400
        
        # Compute impact metrics
        impact_metrics = compute_impact_metrics(
            diameter_m=diameter_m,
            velocity_km_s=velocity_km_s,
            density_kg_m3=data.get('density_kg_m3'),
            impact_angle_deg=data.get('impact_angle_deg'),
            impact_lat=data.get('impact_lat'),
            impact_lon=data.get('impact_lon')
        )
        
        # Get environmental data if location is specified
        environmental_data = None
        if data.get('impact_lat') is not None and data.get('impact_lon') is not None:
            try:
                environmental_data = get_impact_environmental_data(
                    data['impact_lat'], 
                    data['impact_lon']
                )
            except:
                pass  # Environmental data is optional
        
        # Perform risk assessment
        risk_assessment = {
            'overall_risk_level': impact_metrics['risk_level'],
            'energy_risk': _assess_energy_risk(impact_metrics['energy_tnt_tons']),
            'crater_risk': _assess_crater_risk(impact_metrics['crater_diameter_km']),
            'seismic_risk': _assess_seismic_risk(impact_metrics['seismic_magnitude']),
            'tsunami_risk': _assess_tsunami_risk(impact_metrics.get('tsunami_potential', {})),
            'atmospheric_risk': _assess_atmospheric_risk(impact_metrics.get('atmospheric_effects', {})),
            'environmental_risk': _assess_environmental_risk(environmental_data),
            'recommendations': _generate_risk_recommendations(impact_metrics, environmental_data)
        }
        
        return jsonify({
            'success': True,
            'impact_metrics': impact_metrics,
            'environmental_data': environmental_data,
            'risk_assessment': risk_assessment
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def _assess_energy_risk(energy_tnt_tons):
    """Assess risk based on energy release."""
    if energy_tnt_tons > 10000:
        return {'level': 'extreme', 'description': 'Global catastrophic event'}
    elif energy_tnt_tons > 1000:
        return {'level': 'high', 'description': 'Regional catastrophic event'}
    elif energy_tnt_tons > 100:
        return {'level': 'moderate', 'description': 'Regional significant event'}
    elif energy_tnt_tons > 10:
        return {'level': 'low', 'description': 'Local significant event'}
    else:
        return {'level': 'minimal', 'description': 'Local minor event'}

def _assess_crater_risk(crater_diameter_km):
    """Assess risk based on crater size."""
    if crater_diameter_km > 10:
        return {'level': 'extreme', 'description': 'Massive crater formation'}
    elif crater_diameter_km > 3:
        return {'level': 'high', 'description': 'Large crater formation'}
    elif crater_diameter_km > 1:
        return {'level': 'moderate', 'description': 'Moderate crater formation'}
    elif crater_diameter_km > 0.3:
        return {'level': 'low', 'description': 'Small crater formation'}
    else:
        return {'level': 'minimal', 'description': 'Minimal crater formation'}

def _assess_seismic_risk(seismic_magnitude):
    """Assess risk based on seismic magnitude."""
    if seismic_magnitude > 8:
        return {'level': 'extreme', 'description': 'Major earthquake equivalent'}
    elif seismic_magnitude > 7:
        return {'level': 'high', 'description': 'Strong earthquake equivalent'}
    elif seismic_magnitude > 6:
        return {'level': 'moderate', 'description': 'Moderate earthquake equivalent'}
    elif seismic_magnitude > 5:
        return {'level': 'low', 'description': 'Light earthquake equivalent'}
    else:
        return {'level': 'minimal', 'description': 'Minor seismic activity'}

def _assess_tsunami_risk(tsunami_potential):
    """Assess risk based on tsunami potential."""
    if not tsunami_potential:
        return {'level': 'none', 'description': 'No tsunami risk'}
    
    potential = tsunami_potential.get('tsunami_potential', 'low')
    
    if potential == 'high':
        return {'level': 'high', 'description': 'High tsunami risk with significant coastal impact'}
    elif potential == 'moderate':
        return {'level': 'moderate', 'description': 'Moderate tsunami risk'}
    else:
        return {'level': 'low', 'description': 'Low tsunami risk'}

def _assess_atmospheric_risk(atmospheric_effects):
    """Assess risk based on atmospheric effects."""
    if not atmospheric_effects:
        return {'level': 'minimal', 'description': 'Minimal atmospheric effects'}
    
    effects = atmospheric_effects.get('atmospheric_effects', 'minor')
    
    if effects == 'severe':
        return {'level': 'high', 'description': 'Severe atmospheric effects including fireball and airblast'}
    elif effects == 'moderate':
        return {'level': 'moderate', 'description': 'Moderate atmospheric effects'}
    else:
        return {'level': 'low', 'description': 'Minor atmospheric effects'}

def _assess_environmental_risk(environmental_data):
    """Assess risk based on environmental factors."""
    if not environmental_data:
        return {'level': 'unknown', 'description': 'Environmental data not available'}
    
    # Simple risk assessment based on available data
    elevation_data = environmental_data.get('elevation', {})
    population_density = elevation_data.get('population_density', 'unknown')
    
    if population_density == 'high':
        return {'level': 'high', 'description': 'High population density area'}
    elif population_density == 'medium':
        return {'level': 'moderate', 'description': 'Medium population density area'}
    else:
        return {'level': 'low', 'description': 'Low population density area'}

def _generate_risk_recommendations(impact_metrics, environmental_data):
    """Generate risk mitigation recommendations."""
    recommendations = []
    
    # Energy-based recommendations
    energy_tnt_tons = impact_metrics['energy_tnt_tons']
    if energy_tnt_tons > 1000:
        recommendations.append("Immediate emergency response and international coordination required")
        recommendations.append("Large-scale evacuation planning necessary")
    elif energy_tnt_tons > 100:
        recommendations.append("Regional emergency response planning recommended")
        recommendations.append("Monitor local authorities for evacuation orders")
    
    # Location-based recommendations
    if environmental_data:
        elevation_data = environmental_data.get('elevation', {})
        population_density = elevation_data.get('population_density', 'unknown')
        
        if population_density == 'high':
            recommendations.append("Urban evacuation protocols should be activated")
            recommendations.append("Emergency shelter planning is critical")
        
        water_proximity = elevation_data.get('water_proximity_km', 100)
        if water_proximity < 50:
            recommendations.append("Coastal evacuation planning recommended")
            recommendations.append("Tsunami warning systems should be activated")
    
    # Seismic recommendations
    seismic_magnitude = impact_metrics['seismic_magnitude']
    if seismic_magnitude > 7:
        recommendations.append("Seismic monitoring should be enhanced")
        recommendations.append("Structural reinforcement of critical infrastructure recommended")
    
    # General recommendations
    if not recommendations:
        recommendations.append("Monitor situation and prepare for local emergency response")
        recommendations.append("Stay informed through official channels")
    
    return recommendations
