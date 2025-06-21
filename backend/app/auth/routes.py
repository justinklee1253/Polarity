"""
/auth/signup: signup
/auth/login: login 
/auth/logout: logout
/auth/user: fetch current logged in user
"""

import json
import bcrypt
import string
from flask import Blueprint, request, jsonify, current_app, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from ..database import get_db_session
from ..models import User
from ..extensions import blacklist

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def contains_special_char(s):
    return any(char in string.punctuation for char in s)

def validate_password(password):
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least 1 uppercase letter")
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least 1 lowercase letter")
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    if not contains_special_char(password):
        errors.append("Password must contain at least one special character")
    return errors

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
    elif '@' not in email or '.' not in email:
        errors.append("Invalid email format")
    
    password = data.get('password')
    if not password:
        errors.append("Password is required")
    else:
        errors.extend(validate_password(password))

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
                email=request_data.get('email'),
                password=hashed_pw.decode('utf-8'),
                onboarding_completed=False,
                onboarding_step=0,
                name=None,
                age=None,
                is_student=None,
                college_name=None,
                financial_goals=None,
                salary_monthly=None,
                monthly_spending_goal=None,
                total_balance=None,
                username=request_data.get('username'),
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
            
            login_identifier = email or username
            if not login_identifier:
                return jsonify({"error": "Email or username required!"}), 400
            
            login_identifier = login_identifier.strip()
            if '@' in login_identifier: # If it contains @, treat as email and convert to lowercase
                login_identifier = login_identifier.lower()
            
            
            verified_user = db.query(User).filter(
                (User.email == login_identifier) | (User.username == login_identifier)
            ).first()

            if verified_user and bcrypt.checkpw(request_data.get('password').encode('utf-8'), verified_user.password.encode('utf-8')):
                jwt_access_token = create_access_token(identity=str(verified_user.id))
                refresh_token = create_refresh_token(identity=str(verified_user.id)) #allows client to obtain new access tokens without user re-auth
                resp = make_response(jsonify({"access_token": jwt_access_token, 
                                              "message": "Login successful",
                                              "onboarding_completed": verified_user.onboarding_completed,
                                              "onboarding_step": verified_user.onboarding_step,
                                              })) #sending this back to frontend 
                #setting the refresh token as a cookie
                resp.set_cookie(
                    "refresh_token",
                    refresh_token,
                    httponly=True,
                    secure=False, #only over HTTP, False for local dev
                    samesite='Lax' #lax for dev, strict for prod
                )
                return resp, 200
            else:
                return jsonify({"error": "Invalid Credentials"}), 401
    
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required(refresh=True)
def logout():
    try:
        jti = get_jwt()["jti"]
        blacklist.add(jti)
        response = jsonify({"message": "Successfully logged out"})
        response.delete_cookie("refresh_token") 
        return response, 200
    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({"error": "Logout failed"}), 500
    
@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity() #returns identity of JWT accessing this endpoint. 
    
    with get_db_session() as db:
        user = db.query(User).get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        required_fields_complete = all([
            user.name,
            user.age is not None,
            user.is_student is not None,
            user.financial_goals,
            user.salary_monthly is not None,
            user.monthly_spending_goal is not None,
            user.total_balance is not None,
            (user.college_name if user.is_student else True)
        ])

        if required_fields_complete and not user.onboarding_completed:
            user.onboarding_completed = True
            user.onboarding_step = 5
            db.commit()

        try:
            financial_goals = json.loads(user.financial_goals) if user.financial_goals not in (None, '', 'null') else []
        except Exception:
            financial_goals = []

        return jsonify({
            "user_id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "onboarding_completed": user.onboarding_completed,
            "onboarding_step": user.onboarding_step,
            "budget_profile": {
                "salary_monthly": user.salary_monthly,
                "monthly_spending_goal": user.monthly_spending_goal,
                "total_balance": user.total_balance,
            },
            "profile_info": {
                "age": user.age,
                "is_student": user.is_student,
                "college_name": user.college_name,
                "financial_goals": financial_goals
            }
        }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        new_token = create_access_token(identity=current_user_id)
        return jsonify({"access_token": new_token}), 200
    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({"error": "Token refresh failed"}), 500