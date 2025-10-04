"""
Configuration settings for Meteor Madness backend
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'meteor-madness-dev-key'
    NASA_API_KEY = os.environ.get('NASA_API_KEY')
    USGS_API_BASE = 'https://earthquake.usgs.gov/ws/geoserve'
    
    # Physics constants
    TNT_JOULES = 4.184e9  # 1 ton of TNT in Joules
    EARTH_RADIUS_KM = 6371.0
    EARTH_MASS_KG = 5.972e24
    GRAVITATIONAL_CONSTANT = 6.674e-11
    
    # Default asteroid properties
    DEFAULT_DENSITY = 3000.0  # kg/m³ (typical stony asteroid)
    DEFAULT_IMPACT_ANGLE = 45.0  # degrees
    
    # API rate limits
    NASA_API_RATE_LIMIT = 1000  # requests per hour
    USGS_API_RATE_LIMIT = 10000  # requests per hour

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
