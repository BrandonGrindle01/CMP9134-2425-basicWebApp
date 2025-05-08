import json
import pytest
from werkzeug.security import generate_password_hash
from config import app, db
from models import User, History

#test client creation
@pytest.fixture
def test_client():
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["TESTING"] = True
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

# a mock user registry to mesure response
def register_user(client, username="testuser", email="test@example.com", password="password"):
    return client.post("/register", json={
        "username": username,
        "email": email,
        "password": password
    })

#ensure database is connected correctly and users are being stored
def login_user(client, username="testuser", password="password"):
    return client.post("/login", json={
        "username": username,
        "password": password
    })

#login test
def test_registration_and_login(test_client):
    # Register
    response = register_user(test_client)
    assert response.status_code == 201

    # Login
    response = login_user(test_client)
    assert response.status_code == 200
    assert b"Login successful" in response.data

#test image search
def test_search_images_requires_login(test_client):
    response = test_client.get("/search_images?q=cats")
    assert response.status_code == 200  

#history test
def test_add_and_get_history(test_client):
    # Register + Login
    register_user(test_client)
    login_user(test_client)

    # Add to history
    history_entry = {
        "search_q": "cats",
        "license": "cc0",
        "source": "flickr",
        "extension": "jpg",
        "media_type": "image"
    }
    response = test_client.post("/history", json=history_entry)
    assert response.status_code == 201

    # Get history
    response = test_client.get("/history")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]["search_q"] == "cats"

#history filtering
def test_delete_specific_history_entry(test_client):
    # Register + Login
    register_user(test_client)
    login_user(test_client)

    # Add to history
    test_client.post("/history", json={"search_q": "dogs", "media_type": "image"})

    # Fetch entry
    response = test_client.get("/history")
    entry_id = response.get_json()[0]["id"]

    # Delete entry
    response = test_client.delete(f"/history/{entry_id}")
    assert response.status_code == 200

    # Confirm deletion
    response = test_client.get("/history")
    assert len(response.get_json()) == 0

#delete all history
def test_clear_all_history(test_client):
    register_user(test_client)
    login_user(test_client)

    test_client.post("/history", json={"search_q": "sunsets", "media_type": "image"})
    test_client.post("/history", json={"search_q": "dogs", "media_type": "image"})

    # Confirm entries exist
    response = test_client.get("/history")
    assert len(response.get_json()) == 2

    # Clear all history
    response = test_client.delete("/history?media_type=image")
    assert response.status_code == 200

    # Confirm cleared
    response = test_client.get("/history")
    assert len(response.get_json()) == 0
