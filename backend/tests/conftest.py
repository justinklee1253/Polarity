import pytest
from ..app import create_app

#Auth functions + routes 
@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def valid_request_data_for_signup():
   return {
    "username": "winter_soldier",
    "email": "bucky@hydra.org",
    "password": "BuckyBarnes99!",
    "name": "Bucky",
    "age": 105,
    "monthly_spending_goal": 1000,
    "salary_monthly": 5000,
    "total_balance": 15000
}
   
    
        
    

@pytest.fixture
def test_strings():
    return {
        "no_special": "Justin",
        "with_special": "Justin, you are the GOAT.",
        "empty": "",
        "only_special": "!@#$%",
    }

@pytest.fixture
def test_passwords():
    return {
        "valid_password": "Ironman3000?",
        "too_short": "Widow1!",
        "no_upper": "falcon123#",
        "no_lower": "BUCKYBARNES55@",
        "no_num": "Captainamerica$",
        "no_special": "BlackPantha99",
        "multiple_errors": "antman",
    }

@pytest.fixture
def test_signup_data():
    return {
        "valid_username_data": {
        "username": "charlescabbage",
        "email": "randomemail123@gmail.com",
        "password": "Thisishellavalid123!",
    }, 
        "empty_username_data": {
        "username": "",
        "email": "randomemail123@gmail.com",
        "password": "Thisishellavalid123!",
    },
        "invalid_username_data": {
        "username": "da",
        "email": "randomemail123@gmail.com",
        "password": "Thisishellavalid123!",
    }, 
        "empty_password": {
        "username": "validvalid123",
        "email": "randomemail123@gmail.com",
        "password": "",
    }, 
        "missing_email_data": {
        "username": "cooluser",
        "email": "",
        "password": "Validpass1!"
    },
    "invalid_email_no_at_data": {
        "username": "cooluser",
        "email": "email.com",
        "password": "Validpass1!"
    },
    "invalid_email_no_dot_data": {
        "username": "cooluser",
        "email": "email@com",
        "password": "Validpass1!"
    },
    "invalid_password_data": {
        "username": "cooluser",
        "email": "user@gmail.com",
        "password": "short"
    }

    }