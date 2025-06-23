from flask import Blueprint, request, jsonify, current_app, make_response
chat_bp = Blueprint('chat', __name__, url_prefix='/chat')


#Rate-Limiting + Protect routes