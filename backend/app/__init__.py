from flask import Flask
from .config import Config
from .database import test_db_connection
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

def create_app():
    """
    Defining a basic app factory

    1. Create/Initialize Flask app with configurations
    2. Import and register blueprints (1 for each feature: auth, onboarding, dashboard, transactions, categories)

    """
    app = Flask(__name__)
    app.config.from_object(Config)

    jwt = JWTManager(app)

    test_db_connection()

    from .routes import main_bp
    from .auth.routes import auth_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    print("Blueprint 'auth_bp' registered successfully")

    return app



