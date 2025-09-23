from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import bcrypt
import json
from sqlalchemy.exc import IntegrityError

from ..database import get_db_session
from ..models import User

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

def validate_email(email):
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Password validation - at least 6 characters"""
    return len(password) >= 6

@profile_bp.route('/update-email', methods=['PUT'])
@jwt_required()
def update_email():
    """Update user email address"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        new_email = data.get('email', '').strip()
        current_password = data.get('current_password', '')
        
        if not new_email or not current_password:
            return jsonify({"error": "Email and current password are required"}), 400
            
        if not validate_email(new_email):
            return jsonify({"error": "Invalid email format"}), 400
        
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            # Verify current password
            if not bcrypt.checkpw(current_password.encode('utf-8'), user.password.encode('utf-8')):
                return jsonify({"error": "Current password is incorrect"}), 401
                
            # Check if email is already taken by another user
            existing_user = db.query(User).filter(
                User.email == new_email, 
                User.id != user_id
            ).first()
            
            if existing_user:
                return jsonify({"error": "Email is already in use"}), 409
                
            # Update email
            user.email = new_email
            db.commit()
            
            return jsonify({
                "message": "Email updated successfully",
                "email": new_email
            }), 200
            
    except IntegrityError:
        if 'db' in locals():
            db.rollback()
        return jsonify({"error": "Email is already in use"}), 409
    except Exception as e:
        if 'db' in locals():
            db.rollback()
        current_app.logger.error(f"Update email error: {str(e)}")
        return jsonify({"error": "Failed to update email"}), 500

@profile_bp.route('/update-password', methods=['PUT'])
@jwt_required()
def update_password():
    """Update user password"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({"error": "Current password and new password are required"}), 400
            
        if not validate_password(new_password):
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
        
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            # Verify current password
            if not bcrypt.checkpw(current_password.encode('utf-8'), user.password.encode('utf-8')):
                return jsonify({"error": "Current password is incorrect"}), 401
                
            # Hash new password
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), salt)
            
            # Update password
            user.password = hashed_password.decode('utf-8')
            db.commit()
            
            return jsonify({
                "message": "Password updated successfully"
            }), 200
            
    except Exception as e:
        if 'db' in locals():
            db.rollback()
        current_app.logger.error(f"Update password error: {str(e)}")
        return jsonify({"error": "Failed to update password"}), 500

@profile_bp.route('/update-financial', methods=['PUT'])
@jwt_required()
def update_financial_info():
    """Update user financial information and goals"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            # Update financial fields if provided
            if 'monthly_income' in data:
                try:
                    monthly_income = int(data['monthly_income']) if data['monthly_income'] else 0
                    if monthly_income < 0:
                        return jsonify({"error": "Monthly income cannot be negative"}), 400
                    user.salary_monthly = monthly_income
                except (ValueError, TypeError):
                    return jsonify({"error": "Invalid monthly income value"}), 400
                    
            if 'monthly_spending_goal' in data:
                try:
                    spending_goal = int(data['monthly_spending_goal']) if data['monthly_spending_goal'] else 0
                    if spending_goal < 0:
                        return jsonify({"error": "Monthly spending goal cannot be negative"}), 400
                    user.monthly_spending_goal = spending_goal
                except (ValueError, TypeError):
                    return jsonify({"error": "Invalid monthly spending goal value"}), 400
                    
            if 'financial_goals' in data:
                financial_goals = data['financial_goals']
                if isinstance(financial_goals, list):
                    user.financial_goals = json.dumps(financial_goals)
                else:
                    return jsonify({"error": "Financial goals must be a list"}), 400
                    
            db.commit()
            
            # Return updated financial info
            try:
                goals = json.loads(user.financial_goals) if user.financial_goals not in (None, '', 'null') else []
            except Exception:
                goals = []
                
            return jsonify({
                "message": "Financial information updated successfully",
                "budget_profile": {
                    "salary_monthly": user.salary_monthly,
                    "monthly_spending_goal": user.monthly_spending_goal,
                    "total_balance": user.total_balance,
                },
                "financial_goals": goals
            }), 200
            
    except Exception as e:
        if 'db' in locals():
            db.rollback()
        current_app.logger.error(f"Update financial info error: {str(e)}")
        return jsonify({"error": "Failed to update financial information"}), 500

@profile_bp.route('/data', methods=['GET'])
@jwt_required()
def get_profile_data():
    """Get complete profile data for editing"""
    try:
        user_id = get_jwt_identity()
        
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            try:
                financial_goals = json.loads(user.financial_goals) if user.financial_goals not in (None, '', 'null') else []
            except Exception:
                financial_goals = []
                
            return jsonify({
                "user_id": user.id,
                "name": user.name,
                "username": user.username,
                "email": user.email,
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
                },
                "has_bank_connection": user.plaid_access_token is not None
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Get profile data error: {str(e)}")
        return jsonify({"error": "Failed to get profile data"}), 500


