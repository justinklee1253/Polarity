"""
/auth/signup: signup
/auth/login: login 
/auth/logout: logout
/auth/user: fetch current logged in user
"""

import bcrypt
import string
import jwt
import uuid
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from ..database import get_db_session
from ..models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def generate_jwt_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')


def contains_special_char(s):
    return any(char in string.punctuation for char in s)

def validate_signup_data(data):
    errors = []
    password = data.get('password')
    if not data.get('username'):
        errors.append("Username is required")
    if not data.get('email'):
        errors.append("Email is required")
    if not password or len(password) < 7 or not any(c.isupper() for c in password) or not contains_special_char(password):
        errors.append("Password must be at least 7 characters.")

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        with get_db_session() as db:
            request_data = request.get_json()

            errors = validate_signup_data(request_data)
            if errors:
                return jsonify({"error": errors}), 400
            
            #Check if user exists
            existing_user = db.query(User).filter(
                (User.email == request_data.get('email')) | (User.username == request_data.get('username'))
            ).first() #return the first matching user or None if no match found 

            if existing_user:
                return jsonify({"error": "User already exists"}), 409

            password = request_data.get('password')
            bytes = password.encode('utf-8')
            salt = bcrypt.gensalt() #generate pseudo-random string to add to the password
            hashed_pw = bcrypt.hashpw(bytes, salt)
            new_user = User(
                id = request_data.get('id'),
                username = request_data.get('username'),
                email = request_data.get('email'),
                password = hashed_pw.decode('utf-8'),
                name = request_data.get('name'),
                age = request_data.get('name'),
                monthly_spending = request_data.get('monthly_spending_goal', 500),
                salary_monthly = request_data.get('salary_monthly', 0),
                total_balance = request_data.get('total_balance', 0),
            )
            db.add(new_user)
            db.flush() #sends uuid to db but doesn't immediatedly commit --> db generates id and the SQLalchemy retrieves

        token = generate_jwt_token(new_user.id)
        return jsonify({
            "message": "User Created Successfully",
            "user_id": new_user.id
            }), 201
    except Exception as e: 
        return jsonify({"error": "Failed to create user"}), 500
