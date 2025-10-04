"""
Physics calculations for asteroid impact simulation
Based on scientific models for impact cratering and energy calculations
"""

import math
import numpy as np
from config import Config

def compute_impact_metrics(diameter_m, velocity_km_s, density_kg_m3=None, 
                          impact_angle_deg=None, impact_lat=None, impact_lon=None):
    """
    Compute comprehensive impact metrics from asteroid parameters.
    
    Args:
        diameter_m: Asteroid diameter in meters
        velocity_km_s: Impact velocity in km/s
        density_kg_m3: Asteroid density in kg/m³ (default: 3000)
        impact_angle_deg: Impact angle in degrees (default: 45°)
        impact_lat: Impact latitude (optional)
        impact_lon: Impact longitude (optional)
    
    Returns:
        dict: Comprehensive impact metrics
    """
    
    # Use defaults if not provided
    if density_kg_m3 is None:
        density_kg_m3 = Config.DEFAULT_DENSITY
    if impact_angle_deg is None:
        impact_angle_deg = Config.DEFAULT_IMPACT_ANGLE
    
    # Step 1: Basic geometric calculations
    radius_m = diameter_m / 2.0
    volume_m3 = (4.0/3.0) * math.pi * (radius_m**3)
    mass_kg = volume_m3 * density_kg_m3
    
    # Step 2: Velocity conversion and kinetic energy
    velocity_ms = velocity_km_s * 1000.0
    kinetic_energy_j = 0.5 * mass_kg * (velocity_ms**2)
    
    # Step 3: TNT equivalent
    energy_tnt_tons = kinetic_energy_j / Config.TNT_JOULES
    
    # Step 4: Crater diameter estimation (Melosh scaling law)
    # D = 1.161 * (E_tnt)^0.25 * (sin(θ))^0.33
    impact_angle_rad = math.radians(impact_angle_deg)
    crater_diameter_km = 1.161 * (energy_tnt_tons ** 0.25) * (math.sin(impact_angle_rad) ** 0.33)
    
    # Step 5: Seismic magnitude estimation
    # M = (2/3) * log10(E_joules) - 3.2 (simplified relationship)
    seismic_magnitude = (2.0/3.0) * math.log10(kinetic_energy_j) - 3.2
    
    # Step 6: Damage radius estimation
    crater_radius_km = crater_diameter_km / 2.0
    
    # Severe damage: 3x crater radius (complete destruction)
    severe_damage_radius_km = max(0.1, crater_radius_km * 3.0)
    
    # Moderate damage: 10x crater radius (structural damage)
    moderate_damage_radius_km = max(0.2, crater_radius_km * 10.0)
    
    # Light damage: 30x crater radius (broken windows, etc.)
    light_damage_radius_km = max(0.5, crater_radius_km * 30.0)
    
    # Step 7: Tsunami potential (if ocean impact)
    tsunami_potential = estimate_tsunami_potential(kinetic_energy_j, crater_diameter_km)
    
    # Step 8: Atmospheric effects
    atmospheric_effects = estimate_atmospheric_effects(kinetic_energy_j, diameter_m)
    
    return {
        # Basic properties
        "diameter_m": diameter_m,
        "radius_m": radius_m,
        "volume_m3": volume_m3,
        "mass_kg": mass_kg,
        "density_kg_m3": density_kg_m3,
        
        # Velocity and energy
        "velocity_km_s": velocity_km_s,
        "velocity_m_s": velocity_ms,
        "kinetic_energy_j": kinetic_energy_j,
        "energy_tnt_tons": energy_tnt_tons,
        
        # Impact geometry
        "impact_angle_deg": impact_angle_deg,
        "impact_angle_rad": impact_angle_rad,
        
        # Crater properties
        "crater_diameter_km": crater_diameter_km,
        "crater_radius_km": crater_radius_km,
        "crater_depth_km": crater_diameter_km * 0.2,  # Typical depth/diameter ratio
        
        # Seismic effects
        "seismic_magnitude": seismic_magnitude,
        
        # Damage zones
        "severe_damage_radius_km": severe_damage_radius_km,
        "moderate_damage_radius_km": moderate_damage_radius_km,
        "light_damage_radius_km": light_damage_radius_km,
        
        # Environmental effects
        "tsunami_potential": tsunami_potential,
        "atmospheric_effects": atmospheric_effects,
        
        # Location (if provided)
        "impact_lat": impact_lat,
        "impact_lon": impact_lon,
        
        # Risk assessment
        "risk_level": assess_risk_level(energy_tnt_tons, crater_diameter_km),
        "advice": generate_impact_advice(energy_tnt_tons, crater_diameter_km, tsunami_potential)
    }

def estimate_tsunami_potential(kinetic_energy_j, crater_diameter_km):
    """
    Estimate tsunami potential for ocean impacts.
    
    Args:
        kinetic_energy_j: Kinetic energy in Joules
        crater_diameter_km: Crater diameter in kilometers
    
    Returns:
        dict: Tsunami potential metrics
    """
    
    # Simplified tsunami height estimation
    # Based on energy and water depth assumptions
    energy_tnt_tons = kinetic_energy_j / Config.TNT_JOULES
    
    # Initial wave height (meters) - very simplified model
    initial_wave_height_m = 0.1 * (energy_tnt_tons ** 0.25)
    
    # Maximum runup height (meters) - accounts for coastal amplification
    max_runup_height_m = initial_wave_height_m * 3.0
    
    # Affected coastal distance (km) - rough estimate
    affected_coast_km = crater_diameter_km * 50.0
    
    return {
        "initial_wave_height_m": initial_wave_height_m,
        "max_runup_height_m": max_runup_height_m,
        "affected_coast_km": affected_coast_km,
        "tsunami_potential": "high" if initial_wave_height_m > 10 else "moderate" if initial_wave_height_m > 1 else "low"
    }

def estimate_atmospheric_effects(kinetic_energy_j, diameter_m):
    """
    Estimate atmospheric effects of the impact.
    
    Args:
        kinetic_energy_j: Kinetic energy in Joules
        diameter_m: Asteroid diameter in meters
    
    Returns:
        dict: Atmospheric effects
    """
    
    energy_tnt_tons = kinetic_energy_j / Config.TNT_JOULES
    
    # Fireball radius (km) - simplified model
    fireball_radius_km = 0.1 * (energy_tnt_tons ** 0.25)
    
    # Thermal radiation radius (km)
    thermal_radius_km = fireball_radius_km * 5.0
    
    # Airblast overpressure radius (km)
    airblast_radius_km = 0.5 * (energy_tnt_tons ** 0.25)
    
    return {
        "fireball_radius_km": fireball_radius_km,
        "thermal_radiation_radius_km": thermal_radius_km,
        "airblast_radius_km": airblast_radius_km,
        "atmospheric_effects": "severe" if energy_tnt_tons > 1000 else "moderate" if energy_tnt_tons > 10 else "minor"
    }

def assess_risk_level(energy_tnt_tons, crater_diameter_km):
    """
    Assess overall risk level based on energy and crater size.
    
    Args:
        energy_tnt_tons: Energy in tons of TNT equivalent
        crater_diameter_km: Crater diameter in kilometers
    
    Returns:
        str: Risk level assessment
    """
    
    if energy_tnt_tons > 10000 or crater_diameter_km > 10:
        return "extreme"
    elif energy_tnt_tons > 1000 or crater_diameter_km > 3:
        return "high"
    elif energy_tnt_tons > 100 or crater_diameter_km > 1:
        return "moderate"
    elif energy_tnt_tons > 10 or crater_diameter_km > 0.3:
        return "low"
    else:
        return "minimal"

def generate_impact_advice(energy_tnt_tons, crater_diameter_km, tsunami_potential):
    """
    Generate human-readable advice based on impact parameters.
    
    Args:
        energy_tnt_tons: Energy in tons of TNT equivalent
        crater_diameter_km: Crater diameter in kilometers
        tsunami_potential: Tsunami potential dict
    
    Returns:
        list: List of advice strings
    """
    
    advice = []
    
    if energy_tnt_tons < 1e-3:
        advice.append("Very small event - local damage only, if any.")
    elif energy_tnt_tons < 100:
        advice.append("Regional damage possible - monitor local authorities.")
    elif energy_tnt_tons < 10000:
        advice.append("High-energy impact with potential for large-scale effects.")
        advice.append("Emergency planning and evacuation may be necessary.")
    else:
        advice.append("Extreme impact event - global consequences possible.")
        advice.append("Immediate emergency response and international coordination required.")
    
    if tsunami_potential["tsunami_potential"] == "high":
        advice.append("High tsunami risk - coastal evacuation recommended.")
    elif tsunami_potential["tsunami_potential"] == "moderate":
        advice.append("Moderate tsunami risk - coastal areas should be prepared.")
    
    if crater_diameter_km > 5:
        advice.append("Large crater formation - significant geological changes expected.")
    
    return advice

def compute_mitigation_scenario(original_metrics, delta_v_ms, time_to_impact_days):
    """
    Compute the effects of a mitigation attempt (deflection).
    
    Args:
        original_metrics: Original impact metrics dict
        delta_v_ms: Velocity change in m/s
        time_to_impact_days: Time until impact in days
    
    Returns:
        dict: Mitigation scenario results
    """
    
    # Simplified deflection calculation
    # Assuming constant acceleration over the remaining time
    
    time_to_impact_s = time_to_impact_days * 24 * 3600  # Convert to seconds
    
    # Calculate deflection distance
    # d = 0.5 * a * t^2, where a = delta_v / t
    deflection_distance_km = 0.5 * delta_v_ms * time_to_impact_s / 1000.0
    
    # Earth's radius for comparison
    earth_radius_km = Config.EARTH_RADIUS_KM
    
    # Calculate miss distance
    miss_distance_km = deflection_distance_km
    
    # Determine if deflection is successful
    deflection_successful = miss_distance_km > earth_radius_km
    
    # If deflection is partial, calculate reduced impact
    if not deflection_successful:
        # Calculate impact probability reduction
        impact_probability_reduction = min(1.0, miss_distance_km / earth_radius_km)
        
        # Scale down the original metrics
        reduction_factor = 1.0 - impact_probability_reduction
        
        mitigated_metrics = original_metrics.copy()
        mitigated_metrics["energy_tnt_tons"] *= reduction_factor
        mitigated_metrics["crater_diameter_km"] *= (reduction_factor ** 0.25)
        mitigated_metrics["severe_damage_radius_km"] *= (reduction_factor ** 0.25)
        mitigated_metrics["moderate_damage_radius_km"] *= (reduction_factor ** 0.25)
        mitigated_metrics["light_damage_radius_km"] *= (reduction_factor ** 0.25)
        
        mitigated_metrics["mitigation_applied"] = True
        mitigated_metrics["impact_probability_reduction"] = impact_probability_reduction
    else:
        mitigated_metrics = original_metrics.copy()
        mitigated_metrics["mitigation_applied"] = True
        mitigated_metrics["impact_probability_reduction"] = 1.0
    
    return {
        "original_metrics": original_metrics,
        "mitigated_metrics": mitigated_metrics,
        "delta_v_ms": delta_v_ms,
        "time_to_impact_days": time_to_impact_days,
        "deflection_distance_km": deflection_distance_km,
        "miss_distance_km": miss_distance_km,
        "deflection_successful": deflection_successful,
        "earth_radius_km": earth_radius_km
    }
