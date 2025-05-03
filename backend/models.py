from config import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    history = db.relationship('History', backref='user', lazy=True)
    
class History(db.Model):
    __tablename__ = 'history'
    id = db.Column(db.Integer, primary_key=True)
    search_q = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    license = db.Column(db.String(50))
    source = db.Column(db.String(50))
    extension = db.Column(db.String(10))
    media_type = db.Column(db.String(10), default="image")
    timestamp = db.Column(db.DateTime, default=datetime.now())

    def to_json(self):
        return {
            "id": self.id,
            "search_q": self.search_q,
            "user_id": self.user_id,
            "license": self.license,
            "source": self.source,
            "extension": self.extension,
            "media_type": self.media_type,
            "timestamp": self.timestamp.isoformat()
        }
