from flask import Blueprint
# from app.database import engine, test_db_connection


main_bp = Blueprint('main', __name__) #blueprint for the main app 

@main_bp.route('/')
def index():
    return "Hello World"


