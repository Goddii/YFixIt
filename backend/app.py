from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os


load_dotenv()

# Extensions(created here initialised in create app)
db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    # config
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY","dev-secret")
    app.config["SQLALCHEMY_DATABASE_URL"] = os.getenv("DATABASE_URL","sqlite:///yfixit.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")

    # init extensions
    db.init_app(app)
    jwt.init_app(app)

    #allow request from the react frontend
    CORS(app, resources={r"/api/*":{"origins":os.getenv("FRONTEND_URL", "http://localhost:5173")}})

    #register route blueprints
    from routes.auth import auth_bp
    from routes.listings import listings_bp
    from routes.payments import payments_bp


    app.register_blueprints(auth_bp, url_prefix="/api/auth")
    app.register_blueprints(listings_bp, url_prefix="/api/listings")
    app.register_blueprints(payments_bp, url_prefix="/api/payments")


    @app.route("/api/health")
    def health():
        return {"status": "YFixIt backend is running 🚀"}, 200

    # create all tables on first run
    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)


