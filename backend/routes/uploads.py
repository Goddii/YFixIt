from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
import cloudinary
import cloudinary.uploader


uploads_bp = Blueprint('uploads',__name__)

# allowed image types
ALLOWED_EXTENSIONS = {"png","jpeg","jpg", "webp"}

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS
    )

#POST /API/UPLOADS/IMAGE
#PROTECTED -SELLERS ONLY
#FILE FIELD Uploads to cloudinary and returns the resulting secure url
@uploads_bp.route("/image", methods=["POST"])
@jwt_required()
def upload_image():
    role = get_jwt().get("role")
    if role != "seller":
        return jsonify({"error": "Only sellers can upload images"}), 403

    if "image" not in request.files:
        return jsonify({"error":"No image file provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error":"No image file selected"}), 400

    if  not allowed_file(file.filename):
        return jsonify({
            "error":f"Unsupported file type.Allowed: {','.join(sorted(ALLOWED_EXTENSIONS))}"
        }), 400

    try:
        result = cloudinary.uploader.upload(
            file,
            folder="yfixit/listings",
            resource_type = "image",
        )  
    except Exception as e:
        return jsonify({"error":"Image upload failed","details": str(e)}), 502 

    return jsonify({
        "message": "image uploaded successfully",
        "image_url": result.get("secure_url")
    }), 201                         