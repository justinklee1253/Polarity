import os
from dotenv import load_dotenv
from datetime import timedelta


load_dotenv()

class Config: 
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable not set")
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY environment variable not set")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_COOKIE_SECURE = os.getenv('JWT_COOKIE_SECURE', 'False').lower() == 'true'  # True in production, False in local dev
    JWT_COOKIE_CSRF_PROTECT = True #Cross Site Request Forgery
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
    
    DATABASE_URL = os.getenv('DATABASE_URL')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'  # Default to True for local dev

    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

    PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
    PLAID_SECRET = os.getenv('PLAID_SECRET')
    PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')
    PLAID_WEBHOOK_URL = os.getenv('PLAID_WEBHOOK_URL', 'http://localhost:5001/plaid/webhook')
    # PLAID_PRODUCTS = os.getenv('PLAID_PRODUCTS', 'transactions').split(',')
    # PLAID_COUNTRY_CODES = os.getenv('PLAID_COUNTRY_CODES', 'US').split(',')


class ProductionConfig(Config):
    """Production configuration with enhanced security settings"""
    DEBUG = False
    JWT_COOKIE_SECURE = True
    JWT_COOKIE_SAMESITE = 'Strict'
    
    # Override CORS for production - should be set via environment variables
    # CORS_ORIGINS should be set to your production frontend domain(s)
    # SOCKETIO_CORS_ORIGINS should be set to your production frontend domain(s)


class DevelopmentConfig(Config):
    """Development configuration with relaxed security for local development"""
    DEBUG = True
    JWT_COOKIE_SECURE = False
    JWT_COOKIE_SAMESITE = 'Lax'


