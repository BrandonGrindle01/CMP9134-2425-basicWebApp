from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///appdatabase.db"
app.config["SQLALCHEMY_TRACK_MODIFICATION"] = False
app.secret_key = "secret-key"

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False 

db = SQLAlchemy(app)

from main import *

