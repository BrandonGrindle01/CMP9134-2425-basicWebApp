import pytest
from datetime import datetime
from config import app, db
from models import User, History
from werkzeug.security import generate_password_hash


@pytest.fixture(scope='function')
def test_client():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def test_user_model_creation(test_client):
    """Test creating a new User instance."""
    user = User(username="tester", email="tester@example.com", password=generate_password_hash("password"))
    db.session.add(user)
    db.session.commit()

    saved_user = User.query.filter_by(username="tester").first()
    assert saved_user is not None
    assert saved_user.email == "tester@example.com"
    assert saved_user.password != "password"  # Should be hashed


def test_history_model_creation_and_json(test_client):
    """Test History model creation and its JSON output."""
    user = User(username="tester", email="tester@example.com", password=generate_password_hash("password"))
    db.session.add(user)
    db.session.commit()

    history = History(
        search_q="cats",
        user_id=user.id,
        license="cc0",
        source="flickr",
        extension="jpg",
        media_type="image"
    )
    db.session.add(history)
    db.session.commit()

    saved_history = History.query.filter_by(user_id=user.id).first()
    assert saved_history is not None
    assert saved_history.search_q == "cats"

    json_data = saved_history.to_json()
    assert json_data["search_q"] == "cats"
    assert json_data["license"] == "cc0"
    assert json_data["source"] == "flickr"
    assert json_data["extension"] == "jpg"
    assert json_data["media_type"] == "image"
    assert isinstance(json_data["timestamp"], str)
