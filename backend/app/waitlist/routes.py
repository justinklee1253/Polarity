"""
Waitlist routes for early access paywall system
/waitlist/signup: Add email to waitlist
/waitlist/create-payment-intent: Create Stripe payment intent for early access
/waitlist/confirm-payment: Confirm payment and update waitlist status
/waitlist/check-status: Check if email has paid for early access
"""

import os
import stripe
import requests
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from ..database import get_db_session
from ..models import Waitlist

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Zapier webhook configuration
ZAPIER_WEBHOOK_URL = os.getenv('ZAPIER_WEBHOOK_URL')

waitlist_bp = Blueprint('waitlist', __name__, url_prefix='/waitlist')

def validate_email(email):
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def send_to_zapier(email, event_type="waitlist_signup", additional_data=None):
    """Send email data to Zapier webhook"""
    if not ZAPIER_WEBHOOK_URL:
        current_app.logger.info("Zapier webhook URL not configured, skipping webhook")
        return False
        
    try:
        payload = {
            "email": email,
            "event_type": event_type,
            "timestamp": datetime.now().isoformat(),
            "source": "polarity_waitlist"
        }
        
        # Add any additional data
        if additional_data:
            payload.update(additional_data)
        
        response = requests.post(
            ZAPIER_WEBHOOK_URL,
            json=payload,
            timeout=10  # 10 second timeout
        )
        response.raise_for_status()
        current_app.logger.info(f"Successfully sent to Zapier: {email}")
        return True
        
    except requests.RequestException as e:
        current_app.logger.error(f"Zapier webhook failed for {email}: {str(e)}")
        return False
    except Exception as e:
        current_app.logger.error(f"Unexpected error sending to Zapier for {email}: {str(e)}")
        return False

@waitlist_bp.route('/signup', methods=['POST'])
def signup():
    """Add email to waitlist"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        if not validate_email(email):
            return jsonify({"error": "Invalid email format"}), 400
        
        with get_db_session() as db:
            # Check if email already exists
            existing_entry = db.query(Waitlist).filter(Waitlist.email == email).first()
            
            if existing_entry:
                return jsonify({
                    "message": "Email already registered",
                    "paid": existing_entry.paid
                }), 200
            
            # Create new waitlist entry
            new_entry = Waitlist(email=email)
            db.add(new_entry)
            db.commit()
            
            # Send to Zapier webhook (non-blocking)
            send_to_zapier(email, "waitlist_signup", {
                "is_new_signup": True,
                "user_id": new_entry.id
            })
            
            return jsonify({
                "message": "Successfully added to waitlist",
                "paid": False
            }), 201
            
    except IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        current_app.logger.error(f"Waitlist signup error: {str(e)}")
        return jsonify({"error": "Failed to add to waitlist"}), 500

@waitlist_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Create Stripe checkout session for early access"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email or not validate_email(email):
            return jsonify({"error": "Valid email is required"}), 400
        
        with get_db_session() as db:
            # Check if email exists in waitlist
            waitlist_entry = db.query(Waitlist).filter(Waitlist.email == email).first()
            
            if not waitlist_entry:
                return jsonify({"error": "Email not found in waitlist"}), 404
            
            if waitlist_entry.paid:
                return jsonify({"error": "Email has already paid for early access"}), 409
            
            # Get base URL for redirects
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            
            # Create Stripe checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Polarity Lifetime Access - Early Supporter',
                            'description': 'Lifetime subscription with exclusive early supporter benefits, insights into build process, and direct feature request access',
                        },
                        'unit_amount': 999,  # $9.99 in cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                customer_email=email,
                success_url=f'{frontend_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&email={email}&plan=lifetime',
                cancel_url=f'{frontend_url}/thank-you?email={email}',
                metadata={
                    'email': email,
                    'product': 'lifetime_early_supporter',
                    'plan': 'lifetime'
                }
            )
            
            # Store session ID
            waitlist_entry.stripe_payment_intent_id = session.id
            db.commit()
            
            return jsonify({
                "session_id": session.id,
                "url": session.url
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Checkout session creation error: {str(e)}")
        return jsonify({"error": "Failed to create checkout session"}), 500

@waitlist_bp.route('/create-monthly-checkout-session', methods=['POST'])
def create_monthly_checkout_session():
    """Create Stripe checkout session for monthly plan"""
    try:
        # Add debug logging
        current_app.logger.info("Monthly checkout session creation started")
        
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        current_app.logger.info(f"Processing monthly checkout for email: {email}")
        
        if not email or not validate_email(email):
            current_app.logger.error(f"Invalid email: {email}")
            return jsonify({"error": "Valid email is required"}), 400
        
        with get_db_session() as db:
            # Check if email exists in waitlist
            waitlist_entry = db.query(Waitlist).filter(Waitlist.email == email).first()
            
            if not waitlist_entry:
                return jsonify({"error": "Email not found in waitlist"}), 404
            
            if waitlist_entry.paid:
                return jsonify({"error": "Email has already paid for early access"}), 409
            
            # Get base URL for redirects
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            current_app.logger.info(f"Frontend URL: {frontend_url}")
            current_app.logger.info(f"Stripe API key configured: {bool(stripe.api_key)}")
            
            # Create Stripe checkout session for monthly plan
            current_app.logger.info("About to call Stripe checkout session create")
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Polarity First Month - Early Access',
                            'description': 'First month access with exclusive early supporter benefits and feature previews',
                        },
                        'unit_amount': 199,  # $1.99 in cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                customer_email=email,
                success_url=f'{frontend_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&email={email}&plan=monthly',
                cancel_url=f'{frontend_url}/thank-you?email={email}',
                metadata={
                    'email': email,
                    'product': 'monthly_early_access',
                    'plan': 'monthly'
                }
            )
            
            # Store session ID
            waitlist_entry.stripe_payment_intent_id = session.id
            db.commit()
            
            return jsonify({
                "session_id": session.id,
                "url": session.url
            }), 200
            
    except stripe.error.StripeError as e:
        current_app.logger.error(f"Stripe error in monthly checkout: {str(e)}")
        current_app.logger.error(f"Stripe error type: {type(e).__name__}")
        return jsonify({"error": f"Stripe error: {str(e)}"}), 500
    except Exception as e:
        current_app.logger.error(f"Monthly checkout session creation error: {str(e)}")
        current_app.logger.error(f"Error type: {type(e).__name__}")
        import traceback
        current_app.logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({"error": "Failed to create monthly checkout session"}), 500

@waitlist_bp.route('/confirm-payment', methods=['POST'])
def confirm_payment():
    """Confirm payment and update waitlist status"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
        
        # Retrieve checkout session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != 'paid':
            return jsonify({"error": "Payment not completed"}), 400
        
        email = session.metadata.get('email')
        
        with get_db_session() as db:
            waitlist_entry = db.query(Waitlist).filter(
                Waitlist.email == email,
                Waitlist.stripe_payment_intent_id == session_id
            ).first()
            
            if not waitlist_entry:
                return jsonify({"error": "Waitlist entry not found"}), 404
            
            # Update payment status
            waitlist_entry.paid = True
            waitlist_entry.paid_at = datetime.now()
            db.commit()
            
            # Send payment confirmation to Zapier
            plan_type = session.metadata.get('plan', 'unknown')
            send_to_zapier(email, "payment_confirmed", {
                "plan": plan_type,
                "amount": 999 if plan_type == 'lifetime' else 199,  # Amount in cents
                "stripe_session_id": session_id,
                "user_id": waitlist_entry.id
            })
            
            return jsonify({
                "message": "Payment confirmed successfully",
                "email": email,
                "paid": True
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Payment confirmation error: {str(e)}")
        return jsonify({"error": "Failed to confirm payment"}), 500

@waitlist_bp.route('/check-status/<email>', methods=['GET'])
def check_status(email):
    """Check if email has paid for early access"""
    try:
        email = email.strip().lower()
        
        if not validate_email(email):
            return jsonify({"error": "Invalid email format"}), 400
        
        with get_db_session() as db:
            waitlist_entry = db.query(Waitlist).filter(Waitlist.email == email).first()
            
            if not waitlist_entry:
                return jsonify({
                    "email": email,
                    "in_waitlist": False,
                    "paid": False
                }), 200
            
            return jsonify({
                "email": email,
                "in_waitlist": True,
                "paid": waitlist_entry.paid,
                "created_at": waitlist_entry.created_at.isoformat() if waitlist_entry.created_at else None,
                "paid_at": waitlist_entry.paid_at.isoformat() if waitlist_entry.paid_at else None
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Status check error: {str(e)}")
        return jsonify({"error": "Failed to check status"}), 500
