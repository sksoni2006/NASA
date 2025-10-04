"""
Mitigation and deflection simulation logic
Handles asteroid deflection scenarios and impact prevention strategies
"""

import math
import numpy as np
from typing import Dict, List, Tuple
from config import Config

def compute_deflection_scenario(asteroid_data: Dict, deflection_method: str, 
                              deflection_parameters: Dict, time_to_impact_days: float) -> Dict:
    """
    Compute asteroid deflection scenario based on chosen method.
    
    Args:
        asteroid_data: Asteroid properties (diameter, mass, velocity, etc.)
        deflection_method: Method of deflection ('kinetic_impactor', 'gravity_tractor', 'nuclear')
        deflection_parameters: Parameters specific to deflection method
        time_to_impact_days: Time until impact in days
    
    Returns:
        dict: Deflection scenario results
    """
    
    if deflection_method == 'kinetic_impactor':
        return _compute_kinetic_impactor_scenario(asteroid_data, deflection_parameters, time_to_impact_days)
    elif deflection_method == 'gravity_tractor':
        return _compute_gravity_tractor_scenario(asteroid_data, deflection_parameters, time_to_impact_days)
    elif deflection_method == 'nuclear':
        return _compute_nuclear_deflection_scenario(asteroid_data, deflection_parameters, time_to_impact_days)
    else:
        raise ValueError(f"Unknown deflection method: {deflection_method}")

def _compute_kinetic_impactor_scenario(asteroid_data: Dict, parameters: Dict, time_to_impact_days: float) -> Dict:
    """
    Compute kinetic impactor deflection scenario.
    
    Args:
        asteroid_data: Asteroid properties
        parameters: Impactor parameters (mass, velocity, impact_angle)
        time_to_impact_days: Time until impact
    
    Returns:
        dict: Kinetic impactor scenario results
    """
    
    # Extract parameters
    impactor_mass_kg = parameters.get('impactor_mass_kg', 1000.0)  # Default 1 ton
    impactor_velocity_km_s = parameters.get('impactor_velocity_km_s', 10.0)  # Default 10 km/s
    impact_angle_deg = parameters.get('impact_angle_deg', 90.0)  # Default head-on impact
    
    # Asteroid properties
    asteroid_mass_kg = asteroid_data.get('mass_kg', 1e12)  # Default 1 billion tons
    asteroid_velocity_km_s = asteroid_data.get('velocity_km_s', 17.0)
    
    # Convert to SI units
    impactor_velocity_ms = impactor_velocity_km_s * 1000.0
    asteroid_velocity_ms = asteroid_velocity_km_s * 1000.0
    
    # Calculate momentum transfer
    # Assuming inelastic collision with momentum conservation
    impact_angle_rad = math.radians(impact_angle_deg)
    
    # Impactor momentum
    impactor_momentum = impactor_mass_kg * impactor_velocity_ms
    
    # Effective momentum transfer (depends on impact angle and material properties)
    momentum_transfer_efficiency = 0.1 * math.sin(impact_angle_rad)  # Simplified model
    effective_momentum_transfer = impactor_momentum * momentum_transfer_efficiency
    
    # Velocity change imparted to asteroid
    delta_v_ms = effective_momentum_transfer / asteroid_mass_kg
    
    # Calculate deflection distance over time
    time_to_impact_s = time_to_impact_days * 24 * 3600
    deflection_distance_km = delta_v_ms * time_to_impact_s / 1000.0
    
    # Earth's radius for comparison
    earth_radius_km = Config.EARTH_RADIUS_KM
    
    # Calculate miss distance
    miss_distance_km = deflection_distance_km
    
    # Determine success
    deflection_successful = miss_distance_km > earth_radius_km
    
    # Calculate success probability
    success_probability = min(1.0, miss_distance_km / earth_radius_km)
    
    return {
        'deflection_method': 'kinetic_impactor',
        'impactor_mass_kg': impactor_mass_kg,
        'impactor_velocity_km_s': impactor_velocity_km_s,
        'impact_angle_deg': impact_angle_deg,
        'delta_v_ms': delta_v_ms,
        'deflection_distance_km': deflection_distance_km,
        'miss_distance_km': miss_distance_km,
        'deflection_successful': deflection_successful,
        'success_probability': success_probability,
        'time_to_impact_days': time_to_impact_days,
        'earth_radius_km': earth_radius_km,
        'momentum_transfer_efficiency': momentum_transfer_efficiency,
        'effective_momentum_transfer': effective_momentum_transfer
    }

def _compute_gravity_tractor_scenario(asteroid_data: Dict, parameters: Dict, time_to_impact_days: float) -> Dict:
    """
    Compute gravity tractor deflection scenario.
    
    Args:
        asteroid_data: Asteroid properties
        parameters: Tractor parameters (spacecraft_mass, distance, thrust)
        time_to_impact_days: Time until impact
    
    Returns:
        dict: Gravity tractor scenario results
    """
    
    # Extract parameters
    spacecraft_mass_kg = parameters.get('spacecraft_mass_kg', 10000.0)  # Default 10 tons
    tractor_distance_m = parameters.get('tractor_distance_m', 100.0)  # Default 100m
    thrust_N = parameters.get('thrust_N', 1000.0)  # Default 1 kN
    
    # Asteroid properties
    asteroid_mass_kg = asteroid_data.get('mass_kg', 1e12)
    asteroid_diameter_m = asteroid_data.get('diameter_m', 100.0)
    
    # Calculate gravitational force between spacecraft and asteroid
    gravitational_force = Config.GRAVITATIONAL_CONSTANT * spacecraft_mass_kg * asteroid_mass_kg / (tractor_distance_m ** 2)
    
    # Net force on asteroid (thrust minus gravitational attraction)
    net_force_N = thrust_N - gravitational_force
    
    # Acceleration imparted to asteroid
    asteroid_acceleration_ms2 = net_force_N / asteroid_mass_kg
    
    # Calculate total velocity change over time
    time_to_impact_s = time_to_impact_days * 24 * 3600
    delta_v_ms = asteroid_acceleration_ms2 * time_to_impact_s
    
    # Calculate deflection distance
    deflection_distance_km = delta_v_ms * time_to_impact_s / 1000.0
    
    # Earth's radius for comparison
    earth_radius_km = Config.EARTH_RADIUS_KM
    
    # Calculate miss distance
    miss_distance_km = deflection_distance_km
    
    # Determine success
    deflection_successful = miss_distance_km > earth_radius_km
    
    # Calculate success probability
    success_probability = min(1.0, miss_distance_km / earth_radius_km)
    
    return {
        'deflection_method': 'gravity_tractor',
        'spacecraft_mass_kg': spacecraft_mass_kg,
        'tractor_distance_m': tractor_distance_m,
        'thrust_N': thrust_N,
        'gravitational_force_N': gravitational_force,
        'net_force_N': net_force_N,
        'asteroid_acceleration_ms2': asteroid_acceleration_ms2,
        'delta_v_ms': delta_v_ms,
        'deflection_distance_km': deflection_distance_km,
        'miss_distance_km': miss_distance_km,
        'deflection_successful': deflection_successful,
        'success_probability': success_probability,
        'time_to_impact_days': time_to_impact_days,
        'earth_radius_km': earth_radius_km
    }

def _compute_nuclear_deflection_scenario(asteroid_data: Dict, parameters: Dict, time_to_impact_days: float) -> Dict:
    """
    Compute nuclear deflection scenario.
    
    Args:
        asteroid_data: Asteroid properties
        parameters: Nuclear parameters (yield_kt, detonation_distance, detonation_angle)
        time_to_impact_days: Time until impact
    
    Returns:
        dict: Nuclear deflection scenario results
    """
    
    # Extract parameters
    yield_kt = parameters.get('yield_kt', 1.0)  # Default 1 kiloton
    detonation_distance_m = parameters.get('detonation_distance_m', 100.0)  # Default 100m
    detonation_angle_deg = parameters.get('detonation_angle_deg', 0.0)  # Default surface detonation
    
    # Asteroid properties
    asteroid_mass_kg = asteroid_data.get('mass_kg', 1e12)
    asteroid_diameter_m = asteroid_data.get('diameter_m', 100.0)
    
    # Convert yield to Joules (1 kt TNT = 4.184e12 J)
    yield_joules = yield_kt * 4.184e12
    
    # Calculate energy density at asteroid surface
    surface_area_m2 = 4 * math.pi * (asteroid_diameter_m / 2) ** 2
    energy_density_j_m2 = yield_joules / surface_area_m2
    
    # Calculate momentum transfer (simplified model)
    # Assuming some fraction of energy is converted to kinetic energy of ejected material
    momentum_transfer_efficiency = 0.01  # Very simplified
    total_momentum_transfer = math.sqrt(2 * yield_joules * momentum_transfer_efficiency * asteroid_mass_kg)
    
    # Velocity change imparted to asteroid
    delta_v_ms = total_momentum_transfer / asteroid_mass_kg
    
    # Calculate deflection distance over time
    time_to_impact_s = time_to_impact_days * 24 * 3600
    deflection_distance_km = delta_v_ms * time_to_impact_s / 1000.0
    
    # Earth's radius for comparison
    earth_radius_km = Config.EARTH_RADIUS_KM
    
    # Calculate miss distance
    miss_distance_km = deflection_distance_km
    
    # Determine success
    deflection_successful = miss_distance_km > earth_radius_km
    
    # Calculate success probability
    success_probability = min(1.0, miss_distance_km / earth_radius_km)
    
    return {
        'deflection_method': 'nuclear',
        'yield_kt': yield_kt,
        'yield_joules': yield_joules,
        'detonation_distance_m': detonation_distance_m,
        'detonation_angle_deg': detonation_angle_deg,
        'energy_density_j_m2': energy_density_j_m2,
        'momentum_transfer_efficiency': momentum_transfer_efficiency,
        'total_momentum_transfer': total_momentum_transfer,
        'delta_v_ms': delta_v_ms,
        'deflection_distance_km': deflection_distance_km,
        'miss_distance_km': miss_distance_km,
        'deflection_successful': deflection_successful,
        'success_probability': success_probability,
        'time_to_impact_days': time_to_impact_days,
        'earth_radius_km': earth_radius_km
    }

def compare_deflection_methods(asteroid_data: Dict, time_to_impact_days: float) -> Dict:
    """
    Compare different deflection methods for the same asteroid.
    
    Args:
        asteroid_data: Asteroid properties
        time_to_impact_days: Time until impact
    
    Returns:
        dict: Comparison of all deflection methods
    """
    
    # Default parameters for each method
    kinetic_impactor_params = {
        'impactor_mass_kg': 1000.0,
        'impactor_velocity_km_s': 10.0,
        'impact_angle_deg': 90.0
    }
    
    gravity_tractor_params = {
        'spacecraft_mass_kg': 10000.0,
        'tractor_distance_m': 100.0,
        'thrust_N': 1000.0
    }
    
    nuclear_params = {
        'yield_kt': 1.0,
        'detonation_distance_m': 100.0,
        'detonation_angle_deg': 0.0
    }
    
    # Compute scenarios for each method
    kinetic_scenario = _compute_kinetic_impactor_scenario(asteroid_data, kinetic_impactor_params, time_to_impact_days)
    gravity_scenario = _compute_gravity_tractor_scenario(asteroid_data, gravity_tractor_params, time_to_impact_days)
    nuclear_scenario = _compute_nuclear_deflection_scenario(asteroid_data, nuclear_params, time_to_impact_days)
    
    # Rank methods by success probability
    methods = [
        ('kinetic_impactor', kinetic_scenario),
        ('gravity_tractor', gravity_scenario),
        ('nuclear', nuclear_scenario)
    ]
    
    methods.sort(key=lambda x: x[1]['success_probability'], reverse=True)
    
    return {
        'asteroid_data': asteroid_data,
        'time_to_impact_days': time_to_impact_days,
        'kinetic_impactor': kinetic_scenario,
        'gravity_tractor': gravity_scenario,
        'nuclear': nuclear_scenario,
        'recommended_method': methods[0][0],
        'method_ranking': [method[0] for method in methods],
        'comparison_summary': {
            'most_effective': methods[0][0],
            'least_effective': methods[-1][0],
            'success_probabilities': {
                method[0]: method[1]['success_probability'] 
                for method in methods
            }
        }
    }

def optimize_deflection_parameters(asteroid_data: Dict, deflection_method: str, 
                                 time_to_impact_days: float, target_success_probability: float = 0.95) -> Dict:
    """
    Optimize deflection parameters to achieve target success probability.
    
    Args:
        asteroid_data: Asteroid properties
        deflection_method: Method to optimize
        time_to_impact_days: Time until impact
        target_success_probability: Target success probability (0.0 to 1.0)
    
    Returns:
        dict: Optimized parameters and results
    """
    
    if deflection_method == 'kinetic_impactor':
        return _optimize_kinetic_impactor(asteroid_data, time_to_impact_days, target_success_probability)
    elif deflection_method == 'gravity_tractor':
        return _optimize_gravity_tractor(asteroid_data, time_to_impact_days, target_success_probability)
    elif deflection_method == 'nuclear':
        return _optimize_nuclear_deflection(asteroid_data, time_to_impact_days, target_success_probability)
    else:
        raise ValueError(f"Unknown deflection method: {deflection_method}")

def _optimize_kinetic_impactor(asteroid_data: Dict, time_to_impact_days: float, target_success_probability: float) -> Dict:
    """Optimize kinetic impactor parameters."""
    
    # Simple optimization: increase impactor mass until target is reached
    asteroid_mass_kg = asteroid_data.get('mass_kg', 1e12)
    earth_radius_km = Config.EARTH_RADIUS_KM
    
    # Calculate required delta_v for target success probability
    required_miss_distance_km = earth_radius_km * target_success_probability
    time_to_impact_s = time_to_impact_days * 24 * 3600
    required_delta_v_ms = required_miss_distance_km * 1000.0 / time_to_impact_s
    
    # Calculate required impactor mass
    impactor_velocity_ms = 10000.0  # 10 km/s
    momentum_transfer_efficiency = 0.1  # Simplified
    required_momentum_transfer = required_delta_v_ms * asteroid_mass_kg
    required_impactor_mass_kg = required_momentum_transfer / (impactor_velocity_ms * momentum_transfer_efficiency)
    
    # Ensure reasonable bounds
    required_impactor_mass_kg = max(100.0, min(required_impactor_mass_kg, 100000.0))
    
    optimized_params = {
        'impactor_mass_kg': required_impactor_mass_kg,
        'impactor_velocity_km_s': 10.0,
        'impact_angle_deg': 90.0
    }
    
    # Compute scenario with optimized parameters
    optimized_scenario = _compute_kinetic_impactor_scenario(asteroid_data, optimized_params, time_to_impact_days)
    
    return {
        'deflection_method': 'kinetic_impactor',
        'optimized_parameters': optimized_params,
        'optimized_scenario': optimized_scenario,
        'target_success_probability': target_success_probability,
        'achieved_success_probability': optimized_scenario['success_probability'],
        'optimization_successful': optimized_scenario['success_probability'] >= target_success_probability
    }

def _optimize_gravity_tractor(asteroid_data: Dict, time_to_impact_days: float, target_success_probability: float) -> Dict:
    """Optimize gravity tractor parameters."""
    
    # Simple optimization: increase thrust until target is reached
    asteroid_mass_kg = asteroid_data.get('mass_kg', 1e12)
    earth_radius_km = Config.EARTH_RADIUS_KM
    
    # Calculate required delta_v for target success probability
    required_miss_distance_km = earth_radius_km * target_success_probability
    time_to_impact_s = time_to_impact_days * 24 * 3600
    required_delta_v_ms = required_miss_distance_km * 1000.0 / time_to_impact_s
    
    # Calculate required thrust
    required_acceleration_ms2 = required_delta_v_ms / time_to_impact_s
    required_thrust_N = required_acceleration_ms2 * asteroid_mass_kg
    
    # Ensure reasonable bounds
    required_thrust_N = max(100.0, min(required_thrust_N, 1000000.0))
    
    optimized_params = {
        'spacecraft_mass_kg': 10000.0,
        'tractor_distance_m': 100.0,
        'thrust_N': required_thrust_N
    }
    
    # Compute scenario with optimized parameters
    optimized_scenario = _compute_gravity_tractor_scenario(asteroid_data, optimized_params, time_to_impact_days)
    
    return {
        'deflection_method': 'gravity_tractor',
        'optimized_parameters': optimized_params,
        'optimized_scenario': optimized_scenario,
        'target_success_probability': target_success_probability,
        'achieved_success_probability': optimized_scenario['success_probability'],
        'optimization_successful': optimized_scenario['success_probability'] >= target_success_probability
    }

def _optimize_nuclear_deflection(asteroid_data: Dict, time_to_impact_days: float, target_success_probability: float) -> Dict:
    """Optimize nuclear deflection parameters."""
    
    # Simple optimization: increase yield until target is reached
    asteroid_mass_kg = asteroid_data.get('mass_kg', 1e12)
    earth_radius_km = Config.EARTH_RADIUS_KM
    
    # Calculate required delta_v for target success probability
    required_miss_distance_km = earth_radius_km * target_success_probability
    time_to_impact_s = time_to_impact_days * 24 * 3600
    required_delta_v_ms = required_miss_distance_km * 1000.0 / time_to_impact_s
    
    # Calculate required yield
    momentum_transfer_efficiency = 0.01  # Simplified
    required_momentum_transfer = required_delta_v_ms * asteroid_mass_kg
    required_yield_joules = (required_momentum_transfer ** 2) / (2 * momentum_transfer_efficiency * asteroid_mass_kg)
    required_yield_kt = required_yield_joules / 4.184e12
    
    # Ensure reasonable bounds
    required_yield_kt = max(0.1, min(required_yield_kt, 1000.0))
    
    optimized_params = {
        'yield_kt': required_yield_kt,
        'detonation_distance_m': 100.0,
        'detonation_angle_deg': 0.0
    }
    
    # Compute scenario with optimized parameters
    optimized_scenario = _compute_nuclear_deflection_scenario(asteroid_data, optimized_params, time_to_impact_days)
    
    return {
        'deflection_method': 'nuclear',
        'optimized_parameters': optimized_params,
        'optimized_scenario': optimized_scenario,
        'target_success_probability': target_success_probability,
        'achieved_success_probability': optimized_scenario['success_probability'],
        'optimization_successful': optimized_scenario['success_probability'] >= target_success_probability
    }
