import pytest
from ..app.auth.routes import signup, login, contains_special_char, validate_signup_data, validate_password


class TestSignup:
    def setup_method(self, method):
        #initialize any classes, database **, and network connections/env variables?
        pass 

def test_contains_special_char():
    """
    Test contains_special_char() function
    """
    string_with_no_spec_char = "Justin"
    assert contains_special_char(string_with_no_spec_char) == False

    string_with_char = "Justin, you are the GOAT."
    assert contains_special_char(string_with_char) == True

    empty_string = ""
    assert contains_special_char(empty_string) == False 

    only_special_char_string = "!@#$"
    assert contains_special_char(only_special_char_string) == True

def test_validate_password():
    """
    Test validity of passwords
    """

    valid_password = "Thisisaworkingpw11!"
    assert validate_password(valid_password) == []


    too_short_password = "Short1!"
    assert validate_password(too_short_password) == ["Password must be at least 8 characters"]

    no_uppercase = "blahblahblah123!"
    assert validate_password(no_uppercase) == ["Password must contain at least 1 uppercase letter"]

    no_lowercase = "BLAHBLAH1234?"
    assert validate_password(no_lowercase) == ["Password must contain at least 1 lowercase letter"]

    no_number = "Captainamerica$"
    assert validate_password(no_number) == ["Password must contain at least one number"]

    no_special_char = "Moonknight11"
    assert validate_password(no_special_char) == ["Password must contain at least one special character"]
    


def test_validate_signup_data():
    """
    Test validity of username + email addresses
    """

    valid_username_data = {
        "username": "charlescabbage",
        "email": "randomemail123@gmail.com",
        "password": "Thisishellavalid123!",
    }

    empty_username_data = {
        "username": "",
        "email": "randomemail123@gmail.com",
        "password": "Thisishellavalid123!",
    }

    invalid_username_data = {
        "username": "da",
        "email": "randomemail123@gmail.com",
        "password": "Thisishellavalid123!",
    }

    empty_password = {
        "username": "validvalid123",
        "email": "randomemail123@gmail.com",
        "password": "",
    }

    assert validate_signup_data(valid_username_data) == []
    assert validate_signup_data(empty_username_data) == ["Username is required"]
    assert validate_signup_data(invalid_username_data) == ["Username must be at least 3 characters"]
    assert validate_signup_data(empty_password) == ["Password is required"]


    

def test_signup():
    pass

def test_login():
    pass