from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .database import test_db_connection
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from .extensions import blacklist

from flask_socketio import SocketIO

blacklist = set()
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    """
    Defining a basic app factory

    1. Create/Initialize Flask app with configurations
    2. Import and register blueprints (1 for each feature: auth, onboarding, dashboard, transactions, categories)

    """
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, 
         origins=[
             "http://localhost:5173", #localhost dev server
         ],
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
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(onboarding_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(plaid_bp)

    socketio.init_app(app)

    
    # print("Blueprint 'auth_bp' registered successfully")
    # print("Blueprint 'onboarding' registered successfully")


    return app



