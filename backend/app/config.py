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
    DATABASE_URL = os.getenv('DATABASE_URL')
    DEBUG = True

