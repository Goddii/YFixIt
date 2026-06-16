from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from flask_jwt_extended import jwt_required, get_jwt_identity


auth_bp = Blueprint("auth", __name__)

# post /api/auth/register

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # validate required fields
    required =["name", "email", "phone" , "password", "role"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    if data["role"] not in ["buyer","seller"]:
        return jsonify({"error": "Role must be buyer or seller"}),400

    # check for duplicate email or phone
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error" : "An account with this email already exists"}), 409

    if User.query.filter_by(phone=data["phone"]).first():
        return jsonify({"error": "An account with this phone number already exists"}), 409


    # hash password and save user
    hashed_pw = generate_password_hash(data["password"])

    user = User(
        name = data["name"].strip(),
        email = data["email"].strip(),
        phone = data["phone"].strip(),
        password = hashed_pw,
        role = data["role"],
    )

    db.session.add(user)
    db.session.commit()

    # issue jwt immediately so user is logged in after signup
    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})

    return jsonify({
        "message" : "Account created successfully",
        "token" : token,
        "user" : user.to_dict(),
    }), 201

# post/api/auth/login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email", "").lower().strip()
    password = data.get("password", "")


    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error" : "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})

    return jsonify({
        "message" : "Login successful",
        "token" : token,
        "user" : user.to_dict(),
    }), 200

# get /api/auth/me
# return the logged in user's profile(used by react on page load)


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user":user.to_dict()}),200






