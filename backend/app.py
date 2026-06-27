from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_jwt_extended import JWTManager
import cloudinary


from models import db


load_dotenv()

# Extensions(created here initialised in create app)
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    # config
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY","dev-secret")


    #render postgreSql connection string starts with postgres://


    database_url = os.getenv("DATABASE_URL","sqlite:///yfixit.db")

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url    


    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")

    # init extensions
    db.init_app(app)
    jwt.init_app(app)

    # configure cloudinary(used by routes/uploads.py)
    cloudinary.config(
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key = os.getenv("CLOUDINARY_API_KEY"),
        api_secret = os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )

    #allow request from the react frontend supports comma separated list
    frontend_origins = os.getenv("FRONTEND_URL", "http://localhost:5173")
    allowed_origins = [origin.strip() for origin in frontend_origins.split(",")]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    #register route blueprints
    from routes.auth import auth_bp
    from routes.listings import listings_bp
    from routes.payments import payments_bp
    from routes.uploads  import uploads_bp


    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(listings_bp, url_prefix="/api/listings")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(uploads_bp, url_prefix="/api/uploads")


    @app.route("/api/health")
    def health():
        return {"status": "YFixIt backend is running 🚀"}, 200

    # create all tables on first run
    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=8000)

