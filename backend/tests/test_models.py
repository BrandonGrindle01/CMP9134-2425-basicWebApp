import pytest
from models import Contact
def test_contact_model():
    """Test Contact model creation and conversion to JSON."""
    contact = Contact(first_name="Test", last_name="User", email="test@test.com")
    # Test that the properties are set correctly
    assert contact.first_name == "Test"
    assert contact.last_name == "User"
    assert contact.email == "test@test.com"
    # Test the to_json method
    contact_json = contact.to_json()
    assert contact_json["firstName"] == "Test"
    assert contact_json["lastName"] == "User"
    assert contact_json["email"] == "test@test.com"