import os
from dotenv import load_dotenv
from datetime import timedelta


load_dotenv()

class Config: 
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable not set")
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_COOKIE_SECURE = False #only sent by web browser over HTTPS (true in production)
    JWT_COOKIE_CSRF_PROTECT = True #Cross Site Request Forgery
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ["access", "refresh"]
    
    DATABASE_URL = os.getenv('DATABASE_URL')
    DEBUG = True

    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

    PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
    PLAID_SECRET = os.getenv('PLAID_SECRET')
    PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')
    # PLAID_PRODUCTS = os.getenv('PLAID_PRODUCTS', 'transactions').split(',')
    # PLAID_COUNTRY_CODES = os.getenv('PLAID_COUNTRY_CODES', 'US').split(',')


