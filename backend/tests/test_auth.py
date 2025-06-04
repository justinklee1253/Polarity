import pytest
import unittest
from unittest import mock
from app.auth.routes import signup, login, contains_special_char, validate_signup_data, validate_password
from ..app.models import User



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

# @mock.patch("app.auth.routes.get_db_session")
# def test_signup_success(mock_get_db_session, client, valid_request_data_for_signup):
#     mock_db_session = mock.Mock()
#     mock_get_db_session.return_value.__enter__.return_value = mock_db_session

#     # Simulate no existing user
#     mock_db_session.query.return_value.filter.return_value.first.return_value = None

#     # Simulate successful user creation
#     mock_user_instance = mock.Mock()
#     mock_user_instance.id = 42
#     mock_db_session.add.side_effect = lambda user: setattr(user, "id", 42)

#     with mock.patch("app.auth.routes.User", return_value=mock_user_instance):
#         response = client.post("/auth/signup", json=valid_request_data_for_signup)

#     user_id = response.get_json()["user_id"]

#     assert response.status_code == 201
#     assert response.get_json()["message"] == "User Created Successfully"
#     assert isinstance(user_id, int)
#     assert user_id > 0


@mock.patch("app.auth.routes.get_db_session")
def test_signup_duplicate_user(mock_get_db_session, client, valid_request_data_for_signup): #
    mock_db_session = mock.Mock() 
    mock_get_db_session.return_value.__enter__.return_value = mock_db_session
    mock_db_session.query.return_value.filter.return_value.first.return_value = True

    response = client.post("auth/signup", json=valid_request_data_for_signup)

    assert response.status_code == 409
    assert response.get_json()["error"] == "User already exists"

@mock.patch("app.auth.routes.get_db_session")
def test_signup_invalid_data(mock_get_db_session, client):
    mock_db_session = mock.Mock()
    mock_get_db_session.return_value.__enter__.return_value = mock_db_session

    invalid_data = {
        "username": "",
        "email": "bademail.com",
        "password": "weak"
    }

    response = client.post("/auth/signup", json=invalid_data)
    

    assert response.status_code == 400 
    assert "error" in response.get_json()

# @mock.patch("app.auth.routes.get_db_session")
# def test_signup_db_commit_failure(mock_get_db_session, client, valid_request_data_for_signup):
#     mock_db_session = mock.Mock()
#     mock_get_db_session.return_value.__enter__.return_value = mock_db_session

#     # Simulate no existing user
#     mock_db_session.query.return_value.filter.return_value.first.return_value = None

#     # Simulate db.commit() failure
#     mock_db_session.commit.side_effect = Exception("DB failure")

#     # Simulate valid User creation
#     mock_user_instance = mock.Mock()
#     mock_user_instance.id = 123

#     with mock.patch("app.auth.routes.User", return_value=mock_user_instance):
#         response = client.post("/auth/signup", json=valid_request_data_for_signup)

#     assert response.status_code == 500
#     assert "error" in response.get_json()
#     assert response.get_json()["error"] == "Failed to create user"
  

    
    




    

    
    

def test_login():
    pass