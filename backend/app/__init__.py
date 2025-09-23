
# SSL applied only when needed for specific services (like Plaid)
import sys

import os
from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .database import test_db_connection
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from .extensions import blacklist

from flask_socketio import SocketIO

blacklist = set()
# SocketIO CORS - environment-based (default to * for local dev, restrict in production)
socketio_cors_origins = os.getenv('SOCKETIO_CORS_ORIGINS', '*')
socketio = SocketIO(cors_allowed_origins=socketio_cors_origins)

def create_app():
    """
    Defining a basic app factory

    1. Create/Initialize Flask app with configurations
    2. Import and register blueprints (1 for each feature: auth, onboarding, dashboard, transactions, categories)

    """
    app = Flask(__name__)
    
    # Choose configuration based on environment
    if os.getenv('FLASK_ENV') == 'production':
        app.config.from_object('app.config.ProductionConfig')
    else:
        app.config.from_object('app.config.DevelopmentConfig')

    # CORS configuration - environment-based
    allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,https://polarity-eight.vercel.app').split(',')
    CORS(app, 
         origins=allowed_origins,
         supports_credentials=True, 
         allow_headers=[
             "Content-Type",
             "Authorization",
             "Access-Control-Allow-Credentials",
             "Access-Control-Allow-Origin",
             "Access-Control-Allow-Headers", 
             "Access-Control-Allow-Methods"  
             
         ],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type", "Authorization"]
         )

    jwt = JWTManager(app)

    #register blacklist loader
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"] #jti = unique identifer for JWT
        return jti in blacklist

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has been revoked"}), 401

    test_db_connection()

    from .routes import main_bp
    from .auth.routes import auth_bp
    from .onboarding.routes import onboarding_bp
    from .chat.routes import chat_bp
    from .plaid.routes import plaid_bp
    from .transactions.routes import transactions_bp
    from .profile.routes import profile_bp
    from .waitlist.routes import waitlist_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(onboarding_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(plaid_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(waitlist_bp)

    socketio.init_app(app)

    
    # print("Blueprint 'auth_bp' registered successfully")
    # print("Blueprint 'onboarding' registered successfully")


    return app



