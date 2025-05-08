#import flask backend with dependencies and openverse client
from flask import request, jsonify, session
from config import app, db
from openverse_client import openverseAPIclient
from models import User, History
from werkzeug.security import generate_password_hash, check_password_hash
ov_client = openverseAPIclient()

#get API keys (local)
from dotenv import load_dotenv
load_dotenv()

#create a query to send the the API (HTTP REQUEST)
@app.route("/search_images", methods=["GET"])
def search_images():
    """
    Endpoint to search for images using the OpenVerse API
    Query parameters:
    - q: Search query (required)
    - page: Page number (default: 1)
    - page_size: Results per page (default: 20)
    - license: Filter by license type
    - creator: Filter by creator
    - tags: Comma-separated list of tags
    """
    #error handling to ensure non null input
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400
#filter arguements
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 20, type=int)
    license_type = request.args.get("license")
    creator = request.args.get("creator")
    source = request.args.get("source")
    extension = request.args.get("extension")
    tags = request.args.get("tags")
    if tags:
        tags = tags.split(",")

#search params and filters
    results = ov_client.search_images(
        query=query,
        page=page,
        page_size=page_size,
        license_type=license_type,
        source=source,
        extension=extension,
        creator=creator,
        tags=tags
    )

    return jsonify(results)

#see above comments
@app.route("/search_audio", methods=["GET"])
def search_audio():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400

    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 20, type=int)
    license_type = request.args.get("license")
    creator = request.args.get("creator")
    source = request.args.get("source")
    extension = request.args.get("extension")
    tags = request.args.get("tags")
    results = ov_client.search_audio(
        query=query,
        page=page,
        page_size=page_size,
        license_type=license_type,
        source=source,
        extension=extension,
        creator=creator,
        tags=tags
    )

    return jsonify(results)

#register a user to the SQL database, securly hashing their password to ensure encryption.
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"message": "Username or email already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201

#test hashed paswords along with username to either reject connection or accept connection and start a session
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        session["user_id"] = user.id
        print("Logged in user session:", session)
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401
    
#disconnect user from session
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200
    
#get all users, used for administrative and testing purposes
@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email,
    } for user in users])

#handle the storage, viewing and deletion of search history. allow filtering for specific history entries.
@app.route("/history", methods=["GET", "POST", "DELETE"])
def handle_history():
    if "user_id" not in session:
        return jsonify({"message": "User not logged in"}), 401

    if request.method == "POST":
        data = request.get_json()
        search_q = data.get("search_q")
        media_type = data.get("media_type", "image")
        if not search_q:
            return jsonify({"message": "No query provided"}), 400
        new_entry = History(
            search_q=search_q,
            license=data.get("license"),
            source=data.get("source"),
            extension=data.get("extension"), 
            media_type=media_type,
            user_id=session["user_id"])
        db.session.add(new_entry)
        db.session.commit()
        return jsonify({"message": "Added to history"}), 201

    elif request.method == "GET":
        history = History.query.filter_by(user_id=session["user_id"]).all()
        return jsonify([h.to_json() for h in history])

    elif request.method == "DELETE":
        media_type = request.args.get("media_type")
        query = History.query.filter_by(user_id=session["user_id"])
        if media_type:
            query = query.filter_by(media_type=media_type)
        query.delete()
        db.session.commit()
        return jsonify({"message": "All history entries deleted"}), 200


#search for specific history entries
@app.route("/history/search", methods=["GET"])
def search_history():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    q = request.args.get("q", "")
    user_id = session["user_id"]

    if not q:
        return jsonify([])

    results = History.query.filter(
        History.user_id == user_id,
        History.search_q.ilike(f"%{q}%")
    ).all()
    return jsonify([h.to_json() for h in results])

#delete selected entries from history
@app.route("/history/<int:entry_id>", methods=["DELETE"])
def delete_history_entry(entry_id):
    if "user_id" not in session:
        return jsonify({"message": "User not logged in"}), 401

    entry = History.query.filter_by(id=entry_id, user_id=session["user_id"]).first()
    if not entry:
        return jsonify({"message": "History entry not found"}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Entry deleted"}), 200

#run system
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True)
