from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from models import db, Listing

listings_bp = Blueprint("listings", __name__)


# ── GET /api/listings ─────────────────────────────────────────────────────────
# Public — browse all active listings with optional filters
@listings_bp.route("/", methods=["GET"])
def get_listings():
    query = Listing.query.filter_by(status="active")

    # Optional query params: ?category=Phones&condition=Broken&location=Westlands&max_price=5000&search=samsung
    category  = request.args.get("category")
    condition = request.args.get("condition")
    location  = request.args.get("location")
    max_price = request.args.get("max_price", type=float)
    search    = request.args.get("search")
    sort      = request.args.get("sort", "newest")  # newest | price-asc | price-desc

    if category:
        query = query.filter_by(category=category)
    if condition:
        query = query.filter_by(condition=condition)
    if location:
        query = query.filter_by(location=location)
    if max_price:
        query = query.filter(Listing.price <= max_price)
    if search:
        query = query.filter(Listing.title.ilike(f"%{search}%"))

    if sort == "price-asc":
        query = query.order_by(Listing.price.asc())
    elif sort == "price-desc":
        query = query.order_by(Listing.price.desc())
    else:
        query = query.order_by(Listing.created_at.desc())

    listings = query.all()
    return jsonify({"listings": [l.to_dict() for l in listings]}), 200


# ── GET /api/listings/<id> ────────────────────────────────────────────────────
# Public — single listing detail, also increments view count
@listings_bp.route("/<int:listing_id>", methods=["GET"])
def get_listing(listing_id):
    listing = Listing.query.get_or_404(listing_id)

    # Increment view count
    listing.views += 1
    db.session.commit()

    # Related listings (same category, exclude current)
    related = Listing.query.filter(
        Listing.category == listing.category,
        Listing.id       != listing.id,
        Listing.status   == "active"
    ).limit(3).all()

    return jsonify({
        "listing": listing.to_dict(),
        "related": [r.to_dict() for r in related],
    }), 200


# ── POST /api/listings ────────────────────────────────────────────────────────
# Protected — sellers only
@listings_bp.route("/", methods=["POST"])
@jwt_required()
def create_listing():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    if role != "seller":
        return jsonify({"error": "Only sellers can post listings"}), 403

    data = request.get_json()

    required = ["title", "description", "price", "category", "condition", "location"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    listing = Listing(
        title       = data["title"].strip(),
        description = data["description"].strip(),
        price       = float(data["price"]),
        category    = data["category"],
        condition   = data["condition"],
        location    = data["location"],
        image_url   = data.get("image_url"),   # Cloudinary URL — optional for now
        seller_id   = user_id,
    )

    db.session.add(listing)
    db.session.commit()

    return jsonify({
        "message": "Listing created successfully",
        "listing": listing.to_dict(),
    }), 201


# ── PUT /api/listings/<id> ────────────────────────────────────────────────────
# Protected — only the seller who owns it can edit
@listings_bp.route("/<int:listing_id>", methods=["PUT"])
@jwt_required()
def update_listing(listing_id):
    user_id = int(get_jwt_identity())
    listing  = Listing.query.get_or_404(listing_id)

    if listing.seller_id != user_id:
        return jsonify({"error": "You can only edit your own listings"}), 403

    data = request.get_json()

    listing.title       = data.get("title",       listing.title)
    listing.description = data.get("description", listing.description)
    listing.price       = data.get("price",       listing.price)
    listing.category    = data.get("category",    listing.category)
    listing.condition   = data.get("condition",   listing.condition)
    listing.location    = data.get("location",    listing.location)
    listing.status      = data.get("status",      listing.status)
    listing.image_url   = data.get("image_url",   listing.image_url)

    db.session.commit()

    return jsonify({
        "message": "Listing updated",
        "listing": listing.to_dict(),
    }), 200


# ── DELETE /api/listings/<id> ─────────────────────────────────────────────────
# Protected — only the seller who owns it
@listings_bp.route("/<int:listing_id>", methods=["DELETE"])
@jwt_required()
def delete_listing(listing_id):
    user_id = int(get_jwt_identity())
    listing  = Listing.query.get_or_404(listing_id)

    if listing.seller_id != user_id:
        return jsonify({"error": "You can only delete your own listings"}), 403

    db.session.delete(listing)
    db.session.commit()

    return jsonify({"message": "Listing deleted"}), 200


# ── GET /api/listings/seller/me ───────────────────────────────────────────────
# Protected — returns all listings by the logged-in seller
@listings_bp.route("/seller/me", methods=["GET"])
@jwt_required()
def my_listings():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    if role != "seller":
        return jsonify({"error": "Only sellers can access this"}), 403

    listings = Listing.query.filter_by(seller_id=user_id).order_by(Listing.created_at.desc()).all()

    return jsonify({"listings": [l.to_dict() for l in listings]}), 200
