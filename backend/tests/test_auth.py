import pytest
from ..app.auth.routes import signup, login, contains_special_char, validate_signup_data, validate_password


class TestSignup: #class-based testing
    def setup_method(self, method):
        #initialize any classes, database **, and network connections/env variables?
        pass 

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

def test_contains_special_char(test_strings):
    """
    Test contains_special_char() function
    """

    assert contains_special_char(test_strings["no_special"]) is False
    assert contains_special_char(test_strings["with_special"]) is True
    assert contains_special_char(test_strings["empty"]) is False
    assert contains_special_char(test_strings["only_special"]) is True

def test_validate_password(test_passwords):
    """
    Test validity of passwords
    """

    assert validate_password(test_passwords["valid_password"]) == []

    assert validate_password(test_passwords["too_short"]) == ["Password must be at least 8 characters"]

    assert validate_password(test_passwords["no_upper"]) ==  ["Password must contain at least 1 uppercase letter"]

    assert validate_password(test_passwords["no_lower"]) == ["Password must contain at least 1 lowercase letter"]

    assert validate_password(test_passwords["no_num"]) == ["Password must contain at least one number"]

    assert validate_password(test_passwords["no_special"]) == ["Password must contain at least one special character"]

    assert validate_password(test_passwords["multiple_errors"]) == [
        "Password must be at least 8 characters",
        "Password must contain at least 1 uppercase letter",
        "Password must contain at least one number",
        "Password must contain at least one special character"
    ]
    


def test_validate_signup_data(test_signup_data):
    """
    Test validity of username + email addresses
    """

    assert validate_signup_data(test_signup_data["valid_username_data"]) == []
    assert validate_signup_data(test_signup_data["empty_username_data"]) == ["Username is required"]
    assert validate_signup_data(test_signup_data["invalid_username_data"]) == ["Username must be at least 3 characters"]
    assert validate_signup_data(test_signup_data["empty_password"]) == ["Password is required"]
    assert validate_signup_data(test_signup_data["missing_email_data"]) == ["Email is required"]
    assert validate_signup_data(test_signup_data["invalid_email_no_at_data"]) == ["Invalid email format"]
    assert validate_signup_data(test_signup_data["invalid_email_no_dot_data"]) == ["Invalid email format"]
    assert validate_signup_data(test_signup_data["invalid_password_data"]) == [
        "Password must be at least 8 characters",
        "Password must contain at least 1 uppercase letter",
        "Password must contain at least one number",
        "Password must contain at least one special character"
    ]

    

def test_signup():
    pass

def test_login():
    pass