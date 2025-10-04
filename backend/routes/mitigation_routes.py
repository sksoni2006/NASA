"""
Mitigation and deflection API routes
Handles asteroid deflection scenarios and impact prevention strategies
"""

from flask import Blueprint, request, jsonify
from utils.mitigation import (
    compute_deflection_scenario, compare_deflection_methods, 
    optimize_deflection_parameters
)
from utils.physics_calc import compute_impact_metrics, compute_mitigation_scenario

mitigation_bp = Blueprint('mitigation', __name__)

@mitigation_bp.route('/deflect', methods=['POST'])
def deflect_asteroid():
    """
    Compute asteroid deflection scenario using specified method.
    
    JSON body:
    - asteroid_data: Asteroid properties (diameter_m, mass_kg, velocity_km_s, etc.)
    - deflection_method: 'kinetic_impactor', 'gravity_tractor', or 'nuclear'
    - deflection_parameters: Method-specific parameters
    - time_to_impact_days: Time until impact in days
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        # Extract required parameters
        asteroid_data = data.get('asteroid_data')
        deflection_method = data.get('deflection_method')
        deflection_parameters = data.get('deflection_parameters', {})
        time_to_impact_days = data.get('time_to_impact_days')
        
        if not asteroid_data:
            return jsonify({
                'success': False,
                'error': 'asteroid_data is required'
            }), 400
        
        if not deflection_method:
            return jsonify({
                'success': False,
                'error': 'deflection_method is required'
            }), 400
        
        if time_to_impact_days is None:
            return jsonify({
                'success': False,
                'error': 'time_to_impact_days is required'
            }), 400
        
        # Validate deflection method
        valid_methods = ['kinetic_impactor', 'gravity_tractor', 'nuclear']
        if deflection_method not in valid_methods:
            return jsonify({
                'success': False,
                'error': f'deflection_method must be one of: {valid_methods}'
            }), 400
        
        # Compute deflection scenario
        deflection_scenario = compute_deflection_scenario(
            asteroid_data=asteroid_data,
            deflection_method=deflection_method,
            deflection_parameters=deflection_parameters,
            time_to_impact_days=time_to_impact_days
        )
        
        return jsonify({
            'success': True,
            'deflection_scenario': deflection_scenario,
            'input_parameters': {
                'asteroid_data': asteroid_data,
                'deflection_method': deflection_method,
                'deflection_parameters': deflection_parameters,
                'time_to_impact_days': time_to_impact_days
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mitigation_bp.route('/compare-methods', methods=['POST'])
def compare_deflection_methods_endpoint():
    """
    Compare different deflection methods for the same asteroid.
    
    JSON body:
    - asteroid_data: Asteroid properties
    - time_to_impact_days: Time until impact in days
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        asteroid_data = data.get('asteroid_data')
        time_to_impact_days = data.get('time_to_impact_days')
        
        if not asteroid_data:
            return jsonify({
                'success': False,
                'error': 'asteroid_data is required'
            }), 400
        
        if time_to_impact_days is None:
            return jsonify({
                'success': False,
                'error': 'time_to_impact_days is required'
            }), 400
        
        # Compare deflection methods
        comparison = compare_deflection_methods(asteroid_data, time_to_impact_days)
        
        return jsonify({
            'success': True,
            'comparison': comparison
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mitigation_bp.route('/optimize', methods=['POST'])
def optimize_deflection():
    """
    Optimize deflection parameters to achieve target success probability.
    
    JSON body:
    - asteroid_data: Asteroid properties
    - deflection_method: Method to optimize
    - time_to_impact_days: Time until impact in days
    - target_success_probability: Target success probability (0.0 to 1.0, default: 0.95)
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        asteroid_data = data.get('asteroid_data')
        deflection_method = data.get('deflection_method')
        time_to_impact_days = data.get('time_to_impact_days')
        target_success_probability = data.get('target_success_probability', 0.95)
        
        if not asteroid_data:
            return jsonify({
                'success': False,
                'error': 'asteroid_data is required'
            }), 400
        
        if not deflection_method:
            return jsonify({
                'success': False,
                'error': 'deflection_method is required'
            }), 400
        
        if time_to_impact_days is None:
            return jsonify({
                'success': False,
                'error': 'time_to_impact_days is required'
            }), 400
        
        # Validate target success probability
        if not (0.0 <= target_success_probability <= 1.0):
            return jsonify({
                'success': False,
                'error': 'target_success_probability must be between 0.0 and 1.0'
            }), 400
        
        # Optimize deflection parameters
        optimization_result = optimize_deflection_parameters(
            asteroid_data=asteroid_data,
            deflection_method=deflection_method,
            time_to_impact_days=time_to_impact_days,
            target_success_probability=target_success_probability
        )
        
        return jsonify({
            'success': True,
            'optimization_result': optimization_result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mitigation_bp.route('/simulate-mitigation', methods=['POST'])
def simulate_mitigation():
    """
    Simulate the effects of a mitigation attempt on an impact scenario.
    
    JSON body:
    - original_impact_metrics: Original impact metrics from impact simulation
    - delta_v_ms: Velocity change in m/s
    - time_to_impact_days: Time until impact in days
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        original_impact_metrics = data.get('original_impact_metrics')
        delta_v_ms = data.get('delta_v_ms')
        time_to_impact_days = data.get('time_to_impact_days')
        
        if not original_impact_metrics:
            return jsonify({
                'success': False,
                'error': 'original_impact_metrics is required'
            }), 400
        
        if delta_v_ms is None:
            return jsonify({
                'success': False,
                'error': 'delta_v_ms is required'
            }), 400
        
        if time_to_impact_days is None:
            return jsonify({
                'success': False,
                'error': 'time_to_impact_days is required'
            }), 400
        
        # Compute mitigation scenario
        mitigation_scenario = compute_mitigation_scenario(
            original_metrics=original_impact_metrics,
            delta_v_ms=delta_v_ms,
            time_to_impact_days=time_to_impact_days
        )
        
        return jsonify({
            'success': True,
            'mitigation_scenario': mitigation_scenario
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mitigation_bp.route('/deflection-feasibility', methods=['POST'])
def deflection_feasibility():
    """
    Assess the feasibility of different deflection methods for a given scenario.
    
    JSON body:
    - asteroid_data: Asteroid properties
    - time_to_impact_days: Time until impact in days
    - mission_constraints: Optional constraints (budget, technology readiness, etc.)
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        asteroid_data = data.get('asteroid_data')
        time_to_impact_days = data.get('time_to_impact_days')
        mission_constraints = data.get('mission_constraints', {})
        
        if not asteroid_data:
            return jsonify({
                'success': False,
                'error': 'asteroid_data is required'
            }), 400
        
        if time_to_impact_days is None:
            return jsonify({
                'success': False,
                'error': 'time_to_impact_days is required'
            }), 400
        
        # Compare all deflection methods
        comparison = compare_deflection_methods(asteroid_data, time_to_impact_days)
        
        # Assess feasibility for each method
        feasibility_assessment = {}
        
        for method in ['kinetic_impactor', 'gravity_tractor', 'nuclear']:
            method_data = comparison.get(method, {})
            feasibility_assessment[method] = _assess_method_feasibility(
                method, method_data, time_to_impact_days, mission_constraints
            )
        
        # Rank methods by feasibility
        feasibility_ranking = sorted(
            feasibility_assessment.items(),
            key=lambda x: x[1]['overall_feasibility_score'],
            reverse=True
        )
        
        return jsonify({
            'success': True,
            'feasibility_assessment': feasibility_assessment,
            'feasibility_ranking': [method for method, _ in feasibility_ranking],
            'recommended_method': feasibility_ranking[0][0] if feasibility_ranking else None,
            'comparison_data': comparison
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mitigation_bp.route('/mission-planning', methods=['POST'])
def mission_planning():
    """
    Generate mission planning recommendations for asteroid deflection.
    
    JSON body:
    - asteroid_data: Asteroid properties
    - deflection_method: Preferred deflection method
    - time_to_impact_days: Time until impact in days
    - mission_parameters: Mission-specific parameters
    """
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON body required'
            }), 400
        
        asteroid_data = data.get('asteroid_data')
        deflection_method = data.get('deflection_method')
        time_to_impact_days = data.get('time_to_impact_days')
        mission_parameters = data.get('mission_parameters', {})
        
        if not asteroid_data:
            return jsonify({
                'success': False,
                'error': 'asteroid_data is required'
            }), 400
        
        if not deflection_method:
            return jsonify({
                'success': False,
                'error': 'deflection_method is required'
            }), 400
        
        if time_to_impact_days is None:
            return jsonify({
                'success': False,
                'error': 'time_to_impact_days is required'
            }), 400
        
        # Generate mission planning recommendations
        mission_plan = _generate_mission_plan(
            asteroid_data, deflection_method, time_to_impact_days, mission_parameters
        )
        
        return jsonify({
            'success': True,
            'mission_plan': mission_plan
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def _assess_method_feasibility(method, method_data, time_to_impact_days, constraints):
    """Assess feasibility of a deflection method."""
    
    feasibility_factors = {
        'technical_readiness': 0.0,
        'time_requirements': 0.0,
        'cost_effectiveness': 0.0,
        'success_probability': 0.0,
        'risk_level': 0.0
    }
    
    if method == 'kinetic_impactor':
        feasibility_factors['technical_readiness'] = 0.9  # High - proven technology
        feasibility_factors['time_requirements'] = 0.8   # Moderate - requires launch window
        feasibility_factors['cost_effectiveness'] = 0.7  # Good - relatively low cost
        feasibility_factors['success_probability'] = method_data.get('success_probability', 0.0)
        feasibility_factors['risk_level'] = 0.3  # Low risk
        
    elif method == 'gravity_tractor':
        feasibility_factors['technical_readiness'] = 0.6  # Moderate - requires precision
        feasibility_factors['time_requirements'] = 0.4   # High - requires long mission
        feasibility_factors['cost_effectiveness'] = 0.5  # Moderate - higher cost
        feasibility_factors['success_probability'] = method_data.get('success_probability', 0.0)
        feasibility_factors['risk_level'] = 0.2  # Very low risk
        
    elif method == 'nuclear':
        feasibility_factors['technical_readiness'] = 0.4  # Low - political/technical challenges
        feasibility_factors['time_requirements'] = 0.7   # Moderate - can be deployed quickly
        feasibility_factors['cost_effectiveness'] = 0.8  # High - very effective
        feasibility_factors['success_probability'] = method_data.get('success_probability', 0.0)
        feasibility_factors['risk_level'] = 0.8  # High risk - political and technical
    
    # Adjust for time constraints
    if time_to_impact_days < 365:  # Less than 1 year
        if method == 'gravity_tractor':
            feasibility_factors['time_requirements'] *= 0.3  # Severely limited
        elif method == 'kinetic_impactor':
            feasibility_factors['time_requirements'] *= 0.7  # Somewhat limited
    
    # Calculate overall feasibility score
    weights = {
        'technical_readiness': 0.25,
        'time_requirements': 0.20,
        'cost_effectiveness': 0.15,
        'success_probability': 0.30,
        'risk_level': 0.10  # Lower risk is better, so we'll invert this
    }
    
    overall_score = (
        feasibility_factors['technical_readiness'] * weights['technical_readiness'] +
        feasibility_factors['time_requirements'] * weights['time_requirements'] +
        feasibility_factors['cost_effectiveness'] * weights['cost_effectiveness'] +
        feasibility_factors['success_probability'] * weights['success_probability'] +
        (1.0 - feasibility_factors['risk_level']) * weights['risk_level']
    )
    
    return {
        'method': method,
        'feasibility_factors': feasibility_factors,
        'overall_feasibility_score': overall_score,
        'recommendation': _get_feasibility_recommendation(overall_score, method)
    }

def _get_feasibility_recommendation(score, method):
    """Get recommendation based on feasibility score."""
    if score >= 0.8:
        return f"{method.replace('_', ' ').title()} is highly recommended"
    elif score >= 0.6:
        return f"{method.replace('_', ' ').title()} is recommended with some considerations"
    elif score >= 0.4:
        return f"{method.replace('_', ' ').title()} is feasible but has significant challenges"
    else:
        return f"{method.replace('_', ' ').title()} is not recommended for this scenario"

def _generate_mission_plan(asteroid_data, deflection_method, time_to_impact_days, mission_parameters):
    """Generate comprehensive mission planning recommendations."""
    
    mission_plan = {
        'mission_overview': {
            'deflection_method': deflection_method,
            'time_to_impact_days': time_to_impact_days,
            'asteroid_properties': asteroid_data
        },
        'phases': [],
        'timeline': {},
        'resource_requirements': {},
        'risk_assessment': {},
        'success_criteria': {},
        'contingency_plans': []
    }
    
    # Generate mission phases based on deflection method
    if deflection_method == 'kinetic_impactor':
        mission_plan['phases'] = [
            {
                'phase': 'Mission Planning',
                'duration_days': 180,
                'description': 'Design spacecraft, select target, plan trajectory'
            },
            {
                'phase': 'Spacecraft Development',
                'duration_days': 365,
                'description': 'Build and test kinetic impactor spacecraft'
            },
            {
                'phase': 'Launch and Cruise',
                'duration_days': 730,
                'description': 'Launch spacecraft and cruise to asteroid'
            },
            {
                'phase': 'Impact',
                'duration_days': 1,
                'description': 'Execute kinetic impact'
            },
            {
                'phase': 'Verification',
                'duration_days': 30,
                'description': 'Monitor deflection results'
            }
        ]
        
        mission_plan['resource_requirements'] = {
            'spacecraft_mass_kg': 1000,
            'estimated_cost_millions': 500,
            'launch_vehicle': 'Falcon Heavy or equivalent',
            'ground_crew': 50,
            'mission_duration_years': 3.5
        }
        
    elif deflection_method == 'gravity_tractor':
        mission_plan['phases'] = [
            {
                'phase': 'Mission Planning',
                'duration_days': 180,
                'description': 'Design spacecraft, select target, plan trajectory'
            },
            {
                'phase': 'Spacecraft Development',
                'duration_days': 730,
                'description': 'Build and test gravity tractor spacecraft'
            },
            {
                'phase': 'Launch and Cruise',
                'duration_days': 1095,
                'description': 'Launch spacecraft and cruise to asteroid'
            },
            {
                'phase': 'Tractor Operations',
                'duration_days': 1825,
                'description': 'Maintain position and apply gravitational force'
            },
            {
                'phase': 'Verification',
                'duration_days': 90,
                'description': 'Monitor deflection results'
            }
        ]
        
        mission_plan['resource_requirements'] = {
            'spacecraft_mass_kg': 10000,
            'estimated_cost_millions': 2000,
            'launch_vehicle': 'SLS or equivalent',
            'ground_crew': 100,
            'mission_duration_years': 8.0
        }
        
    elif deflection_method == 'nuclear':
        mission_plan['phases'] = [
            {
                'phase': 'Mission Planning',
                'duration_days': 90,
                'description': 'Design mission, obtain approvals, plan trajectory'
            },
            {
                'phase': 'Spacecraft Development',
                'duration_days': 180,
                'description': 'Build and test nuclear deflection spacecraft'
            },
            {
                'phase': 'Launch and Cruise',
                'duration_days': 365,
                'description': 'Launch spacecraft and cruise to asteroid'
            },
            {
                'phase': 'Detonation',
                'duration_days': 1,
                'description': 'Execute nuclear detonation'
            },
            {
                'phase': 'Verification',
                'duration_days': 30,
                'description': 'Monitor deflection results'
            }
        ]
        
        mission_plan['resource_requirements'] = {
            'spacecraft_mass_kg': 5000,
            'estimated_cost_millions': 1000,
            'launch_vehicle': 'SLS or equivalent',
            'ground_crew': 200,
            'mission_duration_years': 2.0
        }
    
    # Generate timeline
    current_time = 0
    for phase in mission_plan['phases']:
        mission_plan['timeline'][phase['phase']] = {
            'start_day': current_time,
            'end_day': current_time + phase['duration_days'],
            'duration_days': phase['duration_days']
        }
        current_time += phase['duration_days']
    
    # Risk assessment
    mission_plan['risk_assessment'] = {
        'technical_risks': _assess_technical_risks(deflection_method),
        'schedule_risks': _assess_schedule_risks(time_to_impact_days, mission_plan['phases']),
        'cost_risks': _assess_cost_risks(deflection_method),
        'political_risks': _assess_political_risks(deflection_method)
    }
    
    # Success criteria
    mission_plan['success_criteria'] = {
        'primary': 'Asteroid deflected to miss Earth by at least 1 Earth radius',
        'secondary': 'Deflection achieved within 10% of predicted parameters',
        'tertiary': 'Mission completed within budget and schedule constraints'
    }
    
    # Contingency plans
    mission_plan['contingency_plans'] = [
        'Backup deflection method ready if primary method fails',
        'Multiple spacecraft launches to increase success probability',
        'International cooperation for resource sharing',
        'Emergency response protocols for partial deflection'
    ]
    
    return mission_plan

def _assess_technical_risks(deflection_method):
    """Assess technical risks for deflection method."""
    if deflection_method == 'kinetic_impactor':
        return ['Navigation accuracy', 'Impact timing', 'Spacecraft reliability']
    elif deflection_method == 'gravity_tractor':
        return ['Precision navigation', 'Long-term spacecraft reliability', 'Fuel management']
    elif deflection_method == 'nuclear':
        return ['Nuclear device reliability', 'Detonation timing', 'Radiation effects']
    return []

def _assess_schedule_risks(time_to_impact_days, phases):
    """Assess schedule risks."""
    total_mission_days = sum(phase['duration_days'] for phase in phases)
    
    if total_mission_days > time_to_impact_days:
        return ['Insufficient time for mission completion', 'Critical path delays']
    elif total_mission_days > time_to_impact_days * 0.8:
        return ['Tight schedule with minimal margin', 'Risk of delays']
    else:
        return ['Adequate schedule margin available']

def _assess_cost_risks(deflection_method):
    """Assess cost risks."""
    if deflection_method == 'nuclear':
        return ['High development costs', 'Political approval costs', 'International cooperation costs']
    elif deflection_method == 'gravity_tractor':
        return ['Long mission duration costs', 'Advanced technology costs']
    else:
        return ['Standard mission cost risks']

def _assess_political_risks(deflection_method):
    """Assess political risks."""
    if deflection_method == 'nuclear':
        return ['Nuclear weapon treaty concerns', 'International approval required', 'Public opposition']
    else:
        return ['Standard international cooperation risks']
