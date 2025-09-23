# Enhanced onboarding.py with webhook integration
import json
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database import get_db_session
from ..models import User

onboarding_bp = Blueprint('onboarding', __name__, url_prefix='/onboarding')

def validate_onboarding_step_data(step, data):
    """
    Helper function to verify data submitted by user at each onboarding step
    """
    errors = []

    if step == 1:
        name = data.get('name', '').strip()
        if not name:
            errors.append("Name is required")
        elif len(name) < 2:
            errors.append("Name must be at least 2 characters")
    
    elif step == 2:
        pass

    elif step == 3:
        age = data.get('age')
        if age is None:
            errors.append("Age is required")
        elif not isinstance(age, int) or age < 13 or age > 120:
            errors.append("Please enter a valid age between 13 and 120")
       
    elif step == 4:
        isCollegeStudent = data.get('is_student')
        if isCollegeStudent is None:
            errors.append("Student status is required")
        if isCollegeStudent and not data.get('college_name', '').strip():
            errors.append("College name is required for students")
        
    elif step == 5:
        financial_goals = data.get('financial_goals')
        if not financial_goals or not isinstance(financial_goals, list):
            errors.append("At least one financial goal must be selected")
        
    elif step == 6:
        monthly_income = data.get('salary_monthly')
        spending_goal = data.get('monthly_spending_goal')

        if monthly_income is None or not isinstance(monthly_income, (int, float)) or monthly_income < 0:
            errors.append("Monthly income must be a valid number (0 or greater)")
        if spending_goal is None or not isinstance(spending_goal, (int, float)) or spending_goal < 0:
            errors.append("Monthly spending goal must be a valid number (0 or greater)")

    return errors

def trigger_onboarding_completion_check(user_id):
    """
    Webhook function to check if onboarding can be completed.
    This is called whenever financial data is updated.
    """
    try:
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return False, "User not found"
            
            # Check if user already completed onboarding
            if user.onboarding_completed:
                return True, "Already completed"
            
            # Check all required fields for onboarding completion
            required_fields_complete = all([
                user.name,
                user.age is not None,
                user.is_student is not None,
                user.financial_goals,
                user.salary_monthly is not None,
                user.monthly_spending_goal is not None,
                user.total_balance is not None,  # This confirms bank connection
                user.plaid_access_token is not None,  # This confirms successful Plaid connection
                (user.college_name if user.is_student else True)
            ])
            
            if required_fields_complete:
                # Mark onboarding as completed
                user.onboarding_completed = True
                user.onboarding_step = 6
                db.commit()
                
                current_app.logger.info(f"Onboarding completed via webhook for user {user_id}")
                return True, "Onboarding completed successfully"
            else:
                return False, "Required fields not yet complete"
                
    except Exception as e:
        current_app.logger.error(f"Error in onboarding completion webhook: {str(e)}")
        return False, str(e)

@onboarding_bp.route('/status', methods=['GET'])
@jwt_required()
def get_onboarding_status():
    try: 
        user_id = get_jwt_identity()

        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            return jsonify({
                "onboarding_completed": user.onboarding_completed,
                "current_step": user.onboarding_step,
                "user_data": {
                    "name": user.name,
                    "age": user.age,
                    "is_student": user.is_student,
                    "college_name": user.college_name,
                    "financial_goals": json.loads(user.financial_goals) if user.financial_goals else [],
                    "salary_monthly": user.salary_monthly,
                    "monthly_spending_goal": user.monthly_spending_goal,
                    "total_balance": user.total_balance,
                    "bank_connected": user.plaid_access_token is not None
                }
            }), 200

    except Exception as e:
        current_app.logger.error(f"Get onboarding status error: {str(e)}")
        return jsonify({"error": "Failed to get onboarding status"}), 500
    
@onboarding_bp.route('/step/<int:step>', methods=['POST'])
@jwt_required()
def update_onboarding_step(step):
    try: 
        user_id = get_jwt_identity()
        request_data = request.get_json()
        
        if request_data is None:
            return jsonify({"error": "No data provided"}), 400
        if step < 1 or step > 6:
            return jsonify({"error": "Invalid step number"}), 400
            
        validation_errors = validate_onboarding_step_data(step, request_data)
        if validation_errors:
            return jsonify({"error": validation_errors}), 400
            
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            # Update user data based on step
            if step == 1:
                name = request_data.get('name')
                if not name or not name.strip():
                    return jsonify({"error": "Name is required"}), 400
                user.name = name.strip()
                
                # Initialize other fields if they're None
                if user.age is None:
                    user.age = 0
                if user.is_student is None:
                    user.is_student = False
                if user.college_name is None:
                    user.college_name = ''
                if user.financial_goals is None:
                    user.financial_goals = json.dumps([])
                if user.salary_monthly is None:
                    user.salary_monthly = 0
                if user.monthly_spending_goal is None:
                    user.monthly_spending_goal = 0
                if user.total_balance is None:
                    user.total_balance = 0
                    
            elif step == 2:
                pass
                
            elif step == 3:
                user.age = request_data.get('age')
                
            elif step == 4:
                user.is_student = request_data.get('is_student')
                if user.is_student:
                    user.college_name = request_data.get('college_name', '').strip()
                else:
                    user.college_name = None
                    
            elif step == 5:
                financial_goals = request_data.get('financial_goals', [])
                user.financial_goals = json.dumps(financial_goals)
                
            elif step == 6:
                # Handle financial data more carefully to avoid defaulting to 0
                salary = request_data.get('salary_monthly')
                spending_goal = request_data.get('monthly_spending_goal')
                
                if salary is not None:
                    user.salary_monthly = int(salary) if salary != 0 else 0
                if spending_goal is not None:
                    user.monthly_spending_goal = int(spending_goal) if spending_goal != 0 else 0
                
                # WEBHOOK TRIGGER: Check if onboarding can be completed after financial data update
                completion_success, completion_message = trigger_onboarding_completion_check(user_id)
                
            # Update onboarding step
            if user.onboarding_step is None:
                user.onboarding_step = 0
            if step > user.onboarding_step:
                user.onboarding_step = step
                
            db.commit()
            
            # Return response with completion status
            response_data = {
                "message": f"Step {step} completed successfully",
                "onboarding_completed": user.onboarding_completed,
                "current_step": user.onboarding_step
            }
            
            # Add webhook result if step 6 (financial data)
            if step == 6:
                response_data["webhook_result"] = {
                    "completion_attempted": True,
                    "success": completion_success,
                    "message": completion_message
                }
            
            return jsonify(response_data), 200
            
    except ValueError as e:
        return jsonify({"error": "Invalid data format"}), 400
    except Exception as e:
        if 'db' in locals():
            db.rollback()
        current_app.logger.error(f"Onboarding step {step} error: {str(e)}")
        return jsonify({"error": f"Failed to update step {step}"}), 500

@onboarding_bp.route('/complete', methods=['POST'])
@jwt_required()
def complete_onboarding():
    try: 
        user_id = get_jwt_identity()
        
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
                
            # Check if all required fields are complete
            required_fields_complete = all([
                user.name,
                user.age is not None,
                user.is_student is not None,
                user.financial_goals,
                user.salary_monthly is not None,
                user.monthly_spending_goal is not None,
                user.total_balance is not None,  # Bank connection required
                user.plaid_access_token is not None,  # Plaid connection required
                (user.college_name if user.is_student else True)
            ])
            
            if not required_fields_complete:
                return jsonify({
                    "error": "Not all required onboarding steps completed",
                    "missing_bank_connection": user.plaid_access_token is None
                }), 400
                
            if required_fields_complete and not user.onboarding_completed:
                user.onboarding_completed = True
                user.onboarding_step = 6
                db.commit()
                
            return jsonify({
                "message": "Onboarding completed successfully",
                "onboarding_completed": user.onboarding_completed,
                "current_step": user.onboarding_step
            }), 200
            
    except Exception as e:
        if 'db' in locals():
            db.rollback()
        current_app.logger.error(f"Complete onboarding error: {str(e)}")
        return jsonify({"error": "Failed to complete onboarding"}), 500

@onboarding_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_onboarding():
    """Reset onboarding progress (useful for testing or user request)"""
    try:
        user_id = get_jwt_identity()
        
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Reset onboarding fields
            user.onboarding_completed = False
            user.onboarding_step = 0
            
            # Optionally reset user data (uncomment if needed)
            # user.name = None
            # user.age = None
            # user.is_student = None
            # user.college_name = None
            # user.financial_goals = None
            # user.salary_monthly = 0
            # user.monthly_spending_goal = 0
            # user.total_balance = 0
            # user.plaid_access_token = None
            
            db.commit()
            
            return jsonify({
                "message": "Onboarding reset successfully",
                "onboarding_completed": False,
                "current_step": 0
            }), 200
            
    except Exception as e:
        if 'db' in locals():
            db.rollback()
        current_app.logger.error(f"Reset onboarding error: {str(e)}")
        return jsonify({"error": "Failed to reset onboarding"}), 500

# New webhook endpoint for manual completion checks
@onboarding_bp.route('/check_completion', methods=['POST'])
@jwt_required()
def check_completion():
    """
    Manual webhook trigger to check if onboarding can be completed.
    This can be called from the frontend when needed.
    """
    user_id = get_jwt_identity()
    
    try:
        completion_success, completion_message = trigger_onboarding_completion_check(user_id)
        return jsonify({
            "onboarding_completed": completion_success,
            "message": completion_message
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error checking onboarding completion: {str(e)}")
        return jsonify({"error": "Failed to check onboarding completion"}), 500