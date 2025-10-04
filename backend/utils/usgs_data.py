"""
USGS (United States Geological Survey) data integration
Fetches elevation, seismic, and geological data for impact analysis
"""

import requests
import json
from typing import Dict, List, Optional, Tuple
from config import Config

class USGSDataError(Exception):
    """Custom exception for USGS API errors"""
    pass

def get_elevation_data(lat: float, lon: float, radius_km: float = 100.0) -> Dict:
    """
    Get elevation data for a specific location and radius.
    
    Args:
        lat: Latitude
        lon: Longitude  
        radius_km: Search radius in kilometers
    
    Returns:
        dict: Elevation data including terrain type, elevation, and geological features
    """
    
    # For demo purposes, we'll simulate elevation data
    # In a real implementation, you would integrate with:
    # - USGS Elevation Point Query Service
    # - NASA SRTM data
    # - OpenTopography API
    
    try:
        # Simulate elevation lookup
        elevation_data = {
            'latitude': lat,
            'longitude': lon,
            'elevation_m': _estimate_elevation(lat, lon),
            'terrain_type': _classify_terrain(lat, lon),
            'geological_features': _get_geological_features(lat, lon),
            'water_proximity_km': _get_water_proximity(lat, lon),
            'population_density': _estimate_population_density(lat, lon),
            'infrastructure_risk': _assess_infrastructure_risk(lat, lon)
        }
        
        return elevation_data
        
    except Exception as e:
        raise USGSDataError(f"Failed to fetch elevation data: {str(e)}")

def get_seismic_zones(lat: float, lon: float, radius_km: float = 500.0) -> Dict:
    """
    Get seismic zone information for impact analysis.
    
    Args:
        lat: Latitude
        lon: Longitude
        radius_km: Search radius in kilometers
    
    Returns:
        dict: Seismic zone data
    """
    
    try:
        # Simulate seismic zone lookup
        seismic_data = {
            'latitude': lat,
            'longitude': lon,
            'seismic_zone': _classify_seismic_zone(lat, lon),
            'fault_proximity_km': _get_fault_proximity(lat, lon),
            'historical_earthquakes': _get_historical_earthquakes(lat, lon, radius_km),
            'seismic_amplification_factor': _get_seismic_amplification(lat, lon),
            'liquefaction_potential': _assess_liquefaction_potential(lat, lon)
        }
        
        return seismic_data
        
    except Exception as e:
        raise USGSDataError(f"Failed to fetch seismic data: {str(e)}")

def get_geological_data(lat: float, lon: float) -> Dict:
    """
    Get comprehensive geological data for impact analysis.
    
    Args:
        lat: Latitude
        lon: Longitude
    
    Returns:
        dict: Geological data including rock type, structure, etc.
    """
    
    try:
        geological_data = {
            'latitude': lat,
            'longitude': lon,
            'rock_type': _classify_rock_type(lat, lon),
            'geological_age': _get_geological_age(lat, lon),
            'structural_features': _get_structural_features(lat, lon),
            'mineral_resources': _get_mineral_resources(lat, lon),
            'groundwater_depth_m': _estimate_groundwater_depth(lat, lon)
        }
        
        return geological_data
        
    except Exception as e:
        raise USGSDataError(f"Failed to fetch geological data: {str(e)}")

def _estimate_elevation(lat: float, lon: float) -> float:
    """Estimate elevation based on latitude and longitude."""
    # Simplified elevation model based on global patterns
    # In reality, you would use actual elevation datasets
    
    # Basic elevation patterns
    if abs(lat) > 60:  # Polar regions
        return 2000.0
    elif abs(lat) > 30:  # Mid-latitudes
        return 500.0
    else:  # Tropical regions
        return 100.0

def _classify_terrain(lat: float, lon: float) -> str:
    """Classify terrain type based on location."""
    # Simplified terrain classification
    if abs(lat) > 60:
        return "polar"
    elif abs(lat) > 30:
        return "temperate"
    elif abs(lat) > 10:
        return "tropical"
    else:
        return "equatorial"

def _get_geological_features(lat: float, lon: float) -> List[str]:
    """Get geological features for the location."""
    features = []
    
    # Simplified geological feature detection
    if abs(lat) > 45:
        features.append("glacial_deposits")
    if abs(lon) > 120:
        features.append("mountainous_terrain")
    if abs(lat) < 30:
        features.append("coastal_plains")
    
    return features

def _get_water_proximity(lat: float, lon: float) -> float:
    """Estimate distance to nearest water body in kilometers."""
    # Simplified water proximity calculation
    # In reality, you would use coastline datasets
    
    # Assume coastal areas are within 50km of water
    if abs(lat) < 30:
        return 25.0
    else:
        return 100.0

def _estimate_population_density(lat: float, lon: float) -> str:
    """Estimate population density category."""
    # Simplified population density estimation
    if abs(lat) < 30 and abs(lon) < 60:
        return "high"
    elif abs(lat) < 45:
        return "medium"
    else:
        return "low"

def _assess_infrastructure_risk(lat: float, lon: float) -> str:
    """Assess infrastructure risk level."""
    # Simplified infrastructure risk assessment
    if abs(lat) < 30:
        return "high"  # Coastal areas with more infrastructure
    else:
        return "medium"

def _classify_seismic_zone(lat: float, lon: float) -> str:
    """Classify seismic zone based on location."""
    # Simplified seismic zone classification
    if abs(lon) > 120:  # Pacific Ring of Fire
        return "high_seismic"
    elif abs(lat) > 45:  # Northern regions
        return "moderate_seismic"
    else:
        return "low_seismic"

def _get_fault_proximity(lat: float, lon: float) -> float:
    """Get distance to nearest fault in kilometers."""
    # Simplified fault proximity
    if abs(lon) > 120:
        return 50.0  # Near major faults
    else:
        return 200.0

def _get_historical_earthquakes(lat: float, lon: float, radius_km: float) -> List[Dict]:
    """Get historical earthquake data within radius."""
    # Simplified historical earthquake data
    earthquakes = []
    
    if abs(lon) > 120:  # Pacific Ring of Fire
        earthquakes = [
            {"magnitude": 7.2, "year": 2011, "distance_km": 25.0},
            {"magnitude": 6.8, "year": 2015, "distance_km": 45.0}
        ]
    
    return earthquakes

def _get_seismic_amplification(lat: float, lon: float) -> float:
    """Get seismic amplification factor for the location."""
    # Simplified seismic amplification
    if abs(lon) > 120:
        return 1.5  # Higher amplification in active seismic zones
    else:
        return 1.0

def _assess_liquefaction_potential(lat: float, lon: float) -> str:
    """Assess liquefaction potential."""
    # Simplified liquefaction assessment
    if abs(lat) < 30:  # Coastal areas
        return "high"
    else:
        return "low"

def _classify_rock_type(lat: float, lon: float) -> str:
    """Classify dominant rock type."""
    # Simplified rock type classification
    if abs(lat) > 45:
        return "igneous"
    elif abs(lat) > 30:
        return "sedimentary"
    else:
        return "metamorphic"

def _get_geological_age(lat: float, lon: float) -> str:
    """Get geological age of the area."""
    # Simplified geological age
    if abs(lat) > 45:
        return "precambrian"
    elif abs(lat) > 30:
        return "paleozoic"
    else:
        return "cenozoic"

def _get_structural_features(lat: float, lon: float) -> List[str]:
    """Get structural geological features."""
    features = []
    
    if abs(lon) > 120:
        features.append("fault_systems")
    if abs(lat) > 45:
        features.append("mountain_ranges")
    
    return features

def _get_mineral_resources(lat: float, lon: float) -> List[str]:
    """Get mineral resources in the area."""
    resources = []
    
    if abs(lat) > 45:
        resources.append("metallic_ores")
    if abs(lon) > 120:
        resources.append("volcanic_minerals")
    
    return resources

def _estimate_groundwater_depth(lat: float, lon: float) -> float:
    """Estimate groundwater depth in meters."""
    # Simplified groundwater depth estimation
    if abs(lat) < 30:
        return 10.0  # Shallow groundwater in coastal areas
    else:
        return 50.0  # Deeper groundwater in continental areas

def get_impact_environmental_data(lat: float, lon: float, radius_km: float = 100.0) -> Dict:
    """
    Get comprehensive environmental data for impact analysis.
    
    Args:
        lat: Latitude
        lon: Longitude
        radius_km: Search radius in kilometers
    
    Returns:
        dict: Comprehensive environmental data
    """
    
    try:
        # Combine all environmental data
        environmental_data = {
            'elevation': get_elevation_data(lat, lon, radius_km),
            'seismic': get_seismic_zones(lat, lon, radius_km),
            'geological': get_geological_data(lat, lon),
            'impact_risk_factors': _assess_impact_risk_factors(lat, lon),
            'mitigation_considerations': _get_mitigation_considerations(lat, lon)
        }
        
        return environmental_data
        
    except Exception as e:
        raise USGSDataError(f"Failed to fetch environmental data: {str(e)}")

def _assess_impact_risk_factors(lat: float, lon: float) -> Dict:
    """Assess risk factors for impact at this location."""
    return {
        'population_risk': _estimate_population_density(lat, lon),
        'infrastructure_risk': _assess_infrastructure_risk(lat, lon),
        'environmental_risk': _assess_environmental_risk(lat, lon),
        'economic_risk': _assess_economic_risk(lat, lon)
    }

def _assess_environmental_risk(lat: float, lon: float) -> str:
    """Assess environmental risk level."""
    if abs(lat) < 30:  # Coastal/tropical areas
        return "high"
    else:
        return "medium"

def _assess_economic_risk(lat: float, lon: float) -> str:
    """Assess economic risk level."""
    if abs(lat) < 30 and abs(lon) < 60:  # Major economic centers
        return "high"
    else:
        return "medium"

def _get_mitigation_considerations(lat: float, lon: float) -> List[str]:
    """Get mitigation considerations for this location."""
    considerations = []
    
    if abs(lat) < 30:
        considerations.append("coastal_evacuation_planning")
        considerations.append("tsunami_warning_systems")
    
    if _estimate_population_density(lat, lon) == "high":
        considerations.append("urban_evacuation_protocols")
        considerations.append("emergency_shelter_planning")
    
    if _classify_seismic_zone(lat, lon) == "high_seismic":
        considerations.append("seismic_monitoring_enhancement")
        considerations.append("structural_reinforcement")
    
    return considerations
