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
from flask import Blueprint, request, jsonify, current_app, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt
from datetime import datetime, timedelta
import sys
import os
from ..database import get_db_session
from ..models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def contains_special_char(s):
    return any(char in string.punctuation for char in s)

def validate_signup_data(data):
    errors = []
    username = data.get('username')
    if not username:
        errors.append("Username is required")
    elif len(username) < 3:
        errors.append("Username must be at least 3 characters")
    
    email = data.get('email', '').strip()
    if not email:
        errors.append("Email is required")
    elif '@' not in email:
        errors.append("Invalid email format")
    
    password = data.get('password')
    if not password:
        errors.append("Password not found")
    else:
        if len(password) < 8:
            errors.append("Password must be at least 8 characters")
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least 1 uppercase letter")
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least 1 lowercase character")
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        if not contains_special_char(password):
            errors.append("Password must contain at least one special character")

    return errors

@auth_bp.route('/test', methods=['GET'])
def testing():
    return "Testing testing"

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
            bytes_password = password.encode('utf-8')
            salt = bcrypt.gensalt() #generate pseudo-random string to add to the password
            hashed_pw = bcrypt.hashpw(bytes_password, salt)
            new_user = User(
                username = request_data.get('username'),
                email = request_data.get('email'),
                password = hashed_pw.decode('utf-8'),
                name = request_data.get('name'),
                age = request_data.get('age'),
                monthly_spending_goal = request_data.get('monthly_spending_goal', 500),
                salary_monthly = request_data.get('salary_monthly', 0),
                total_balance = request_data.get('total_balance', 0),
            )
            db.add(new_user)
            db.commit()

            user_id = new_user.id

        return jsonify({
            "message": "User Created Successfully",
            "user_id": user_id,
            }), 201
    except Exception as e: 
        if db is not None:
            db.rollback()
        current_app.logger.error(f"Signup error: {str(e)}")
        return jsonify({"error": "Failed to create user"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try: 
        with get_db_session() as db:
            request_data = request.get_json()
            password = request_data.get('password')
            email = request_data.get('email')
            username = request_data.get('username')

            if not password:
                return jsonify({"error": "Password is required"}), 400
            
            if email:
                email = email.strip().lower()
            if username:
                username = username.strip()
            
            if not email and not username:
                return jsonify({"error": "Email or username required!"}), 400
            
            verified_user = db.query(User).filter(
                (User.email == email) | (User.username == username)
            ).first() #check db

            if verified_user and bcrypt.checkpw(request_data.get('password').encode('utf-8'), verified_user.password.encode('utf-8')):
                jwt_access_token = create_access_token(identity=verified_user.id)
                refresh_token = create_refresh_token(identity=verified_user.id) #allows client to obtain new access tokens without user re-auth
                resp = make_response(jsonify({"access_token": jwt_access_token}))
                resp.set_cookie(
                    "refresh_token",
                    refresh_token,
                    httponly=True,
                    secure=True, #only over HTTP
                    samesite='Strict'
                )
                return resp, 200
            else:
                return jsonify({"error": "Invalid Credentials"}), 401
    
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500
        