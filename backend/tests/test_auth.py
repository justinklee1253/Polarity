import pytest
from ..app.auth.routes import signup, login, contains_special_char, validate_signup_data, validate_password


class TestSignup: #class-based testing
    def setup_method(self, method):
        #initialize any classes, database **, and network connections/env variables?
        pass 

def test_contains_special_char(test_strings):
    """
    Test contains_special_char() function
    """

    assert contains_special_char(test_strings["no_special"]) is False
    assert contains_special_char(test_strings["with_special"]) is True
    assert contains_special_char(test_strings["empty"]) is False
    assert contains_special_char(test_strings["only_special"]) is True

@pytest.mark.parametrize("password, expected_errors", [
    ("Ironman3000?", []),
    ("Widow1!", ["Password must be at least 8 characters"]),
    ("falcon123#", ["Password must contain at least 1 uppercase letter"]),
    ("BUCKYBARNES55@", ["Password must contain at least 1 lowercase letter"]),
    ("Captainamerica$", ["Password must contain at least one number"]),
    ("BlackPantha99", ["Password must contain at least one special character"]),
    ("antman", [
        "Password must be at least 8 characters",
        "Password must contain at least 1 uppercase letter",
        "Password must contain at least one number",
        "Password must contain at least one special character"
    ]),
])
def test_validate_password_param(password, expected_errors):
    assert validate_password(password) == expected_errors
    


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