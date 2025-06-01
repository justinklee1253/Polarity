import os
from dotenv import load_dotenv


load_dotenv()

class Config: 
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable not set")
    DATABASE_URL = os.getenv('DATABASE_URL')
    DEBUG = True