# YFixIt Backend Mentor Guide

This guide explains the YFixIt backend like I would explain it to you as a junior developer building confidence in Flask, APIs, SQL, authentication, and frontend-backend connection.

The goal is not only to tell you what the files do. The goal is to help you understand how data moves through the whole app, from a user clicking a button in React, to Flask receiving the request, to SQLAlchemy saving or reading data, then back to React as JSON.

## 1. Big Picture

YFixIt is a marketplace app for repairable electronics.

The frontend is built with React. The backend is built with Flask. The database is managed through SQLAlchemy. The frontend and backend talk through HTTP API routes.

Think of the app in four layers:

```text
React page/component
    calls
src/api.js
    sends HTTP request to
Flask route
    reads/writes
SQLAlchemy models and database
```

Example:

```text
Seller submits new listing form
-> SellerDashboard.jsx calls api.createListing()
-> src/api.js sends POST /api/listings/
-> backend/routes/listings.py validates the request
-> Listing model is saved to the database
-> Flask returns JSON
-> React updates the page with the new listing
```

That is the full-stack loop.

## 2. Backend File Structure

The backend lives in the `backend/` folder:

```text
backend/
|-- app.py
|-- models.py
`-- routes/
    |-- __init__.py
    |-- auth.py
    |-- listings.py
    `-- payments.py
```

Each file has a clear responsibility:

| File | Responsibility |
| --- | --- |
| `backend/app.py` | Creates the Flask app, loads config, connects extensions, registers routes |
| `backend/models.py` | Defines database tables using SQLAlchemy models |
| `backend/routes/auth.py` | Handles register, login, and current-user profile |
| `backend/routes/listings.py` | Handles listing browse, detail, create, edit, delete, seller listings |
| `backend/routes/payments.py` | Handles M-Pesa STK Push, callback, order status, buyer orders |

This is a good beginner-friendly backend structure because it separates app setup, database structure, and API behavior.

## 3. How `app.py` Starts The Backend

The backend begins in `backend/app.py`.

Important pieces:

```python
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from models import db
```

These imports tell us what the backend uses:

| Tool | Meaning |
| --- | --- |
| Flask | The web framework |
| Flask-CORS | Allows React to call the Flask API from another port |
| python-dotenv | Loads environment variables from `.env` |
| Flask-JWT-Extended | Creates and verifies login tokens |
| Flask-SQLAlchemy | Connects Python classes to database tables |

The app uses an app factory:

```python
def create_app():
    app = Flask(__name__)
```

An app factory is a function that creates and configures the Flask app. This is cleaner than putting everything globally because it becomes easier to test and extend later.

### Configuration

Inside `create_app()`, the backend reads values from `.env`:

```python
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///yfixit.db")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
```

This means:

| Config | Purpose |
| --- | --- |
| `SECRET_KEY` | General Flask secret |
| `SQLALCHEMY_DATABASE_URI` | Database connection string |
| `JWT_SECRET_KEY` | Secret used to sign login tokens |

In development, default values are okay. In production, default secrets are not safe.

### Extension Setup

```python
db.init_app(app)
jwt.init_app(app)
```

This connects SQLAlchemy and JWT support to the Flask app.

### CORS Setup

```python
CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_URL", "http://localhost:5173")}})
```

React runs on `http://localhost:5173`.
Flask runs on `http://localhost:8000`.

Browsers block frontend requests to another server unless the backend allows it. CORS is what allows your React app to call your Flask API.

### Blueprint Registration

```python
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(listings_bp, url_prefix="/api/listings")
app.register_blueprint(payments_bp, url_prefix="/api/payments")
```

Blueprints group related routes.

This means:

| Blueprint | Prefix | Example full route |
| --- | --- | --- |
| `auth_bp` | `/api/auth` | `/api/auth/login` |
| `listings_bp` | `/api/listings` | `/api/listings/` |
| `payments_bp` | `/api/payments` | `/api/payments/stk-push` |

### Table Creation

```python
with app.app_context():
    db.create_all()
```

This creates database tables from your models if they do not already exist.

This is fine for learning and early development. For production, use migrations with Flask-Migrate/Alembic instead of `db.create_all()`.

## 4. How The Database Is Designed

The database structure is in `backend/models.py`.

You have three main tables:

```text
users
listings
orders
```

### User Model

```python
class User(db.Model):
    __tablename__ = "users"
```

A user can be a buyer or seller.

Important fields:

| Field | Meaning |
| --- | --- |
| `id` | Primary key |
| `name` | User's full name |
| `email` | Unique login email |
| `phone` | Unique phone number |
| `password` | Hashed password |
| `role` | Either `buyer` or `seller` |
| `created_at` | Account creation time |

Important relationship:

```python
listings = db.relationship("Listing", backref="seller", lazy=True)
orders = db.relationship("Order", backref="buyer", lazy=True)
```

This means:

```python
seller.listings
buyer.orders
```

can be used to access related data.

### Listing Model

Listings are the items sellers post.

Important fields:

| Field | Meaning |
| --- | --- |
| `title` | Item title |
| `description` | Details about the item |
| `price` | Price in Ksh |
| `category` | Phones, Laptops, etc. |
| `condition` | Good, Fair, Broken |
| `location` | Seller location |
| `image_url` | Optional image URL |
| `status` | `active` or `sold` |
| `views` | Number of detail-page views |
| `seller_id` | Foreign key pointing to `users.id` |

This line connects a listing to a seller:

```python
seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
```

In plain English:

> Every listing must belong to one user.

### Order Model

Orders are created when a buyer starts an M-Pesa payment.

Important fields:

| Field | Meaning |
| --- | --- |
| `amount` | Payment amount |
| `status` | `pending`, `completed`, or `failed` |
| `mpesa_checkout_id` | M-Pesa checkout request ID |
| `mpesa_receipt` | Receipt number after successful payment |
| `phone` | Buyer phone used for STK Push |
| `buyer_id` | Foreign key pointing to the buyer |
| `listing_id` | Foreign key pointing to the listing |

In plain English:

> An order belongs to one buyer and one listing.

## 5. Why `to_dict()` Matters

Each model has a `to_dict()` method.

Example:

```python
def to_dict(self):
    return {
        "id": self.id,
        "name": self.name,
        "email": self.email,
        "phone": self.phone,
        "role": self.role,
        "created_at": self.created_at.isoformat()
    }
```

SQLAlchemy objects cannot be sent directly to React. Flask must convert them into JSON-friendly dictionaries first.

This is why routes return:

```python
jsonify({"user": user.to_dict()})
```

The frontend receives normal JSON:

```json
{
  "user": {
    "id": 1,
    "name": "Jane",
    "email": "jane@example.com",
    "role": "buyer"
  }
}
```

## 6. Authentication Flow

Authentication means knowing who the user is.

YFixIt uses JWT tokens.

JWT means JSON Web Token. It is a signed string that proves the user logged in.

### Register Flow

Frontend:

```text
Signup.jsx
-> useAuth().register()
-> api.register()
-> POST /api/auth/register
```

Backend:

```python
@auth_bp.route("/register", methods=["POST"])
def register():
```

Step by step:

1. React sends name, email, phone, password, and role.
2. Flask checks required fields.
3. Flask checks that role is either `buyer` or `seller`.
4. Flask checks that email and phone are not already used.
5. Flask hashes the password.
6. Flask saves the user.
7. Flask creates a JWT token.
8. Flask returns the token and user data.

Important line:

```python
hashed_pw = generate_password_hash(data["password"])
```

You never store the raw password. You store a hash.

Then:

```python
token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
```

The token stores:

| Token data | Purpose |
| --- | --- |
| user id | So the backend can find the logged-in user |
| role | So the backend can know buyer vs seller |

### Login Flow

Frontend:

```text
Login.jsx
-> useAuth().login()
-> api.login()
-> POST /api/auth/login
```

Backend:

```python
@auth_bp.route("/login", methods=["POST"])
def login():
```

Step by step:

1. React sends email and password.
2. Flask finds the user by email.
3. Flask compares the submitted password with the stored hash.
4. If valid, Flask creates a JWT token.
5. React stores that token in `localStorage`.

Frontend storage happens here:

```javascript
localStorage.setItem("token", data.token);
```

### Current User Flow

Frontend calls:

```javascript
api.me()
```

Backend route:

```python
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
```

The `@jwt_required()` decorator means:

> This route only works if the request includes a valid JWT token.

The backend reads the logged-in user id:

```python
user_id = int(get_jwt_identity())
```

Then it fetches the user from the database:

```python
user = db.session.get(User, user_id)
```

## 7. How Protected Requests Work

The frontend helper in `src/api.js` automatically attaches the token:

```javascript
const token = localStorage.getItem("token");

headers: {
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
}
```

So a protected request looks like this:

```text
Authorization: Bearer eyJ...
```

Then Flask-JWT-Extended reads and verifies the token on routes with:

```python
@jwt_required()
```

This is how Flask knows which user is making the request.

## 8. Listings API

Listing routes are in `backend/routes/listings.py`.

### Browse Listings

Route:

```text
GET /api/listings/
```

Frontend:

```text
Browse.jsx
BuyerDashboard.jsx
```

Backend:

```python
query = Listing.query.filter_by(status="active")
```

Only active listings are shown publicly.

The backend also supports filters:

```text
category
condition
location
max_price
search
sort
```

Example URL:

```text
/api/listings/?category=Phones&condition=Broken&max_price=5000&search=samsung
```

Important note: the current `Browse.jsx` mostly loads all active listings first, then filters in React. Since the backend already supports filters, a nice improvement would be to send the filters to the backend instead of filtering only in the browser.

### Listing Detail

Route:

```text
GET /api/listings/<listing_id>
```

Frontend:

```text
ListingDetail.jsx
```

Backend:

1. Finds the listing.
2. Increments the view count.
3. Finds up to 3 related listings in the same category.
4. Returns listing plus related listings.

Important line:

```python
listing.views += 1
db.session.commit()
```

That is why the seller dashboard can show view counts.

### Create Listing

Route:

```text
POST /api/listings/
```

Frontend:

```text
SellerDashboard.jsx
```

Backend protection:

```python
@jwt_required()
```

Seller-only check:

```python
role = get_jwt().get("role")

if role != "seller":
    return jsonify({"error": "Only sellers can post listings"}), 403
```

Step by step:

1. React sends listing data.
2. Flask confirms the user is logged in.
3. Flask confirms the user is a seller.
4. Flask validates required fields.
5. Flask creates a `Listing`.
6. Flask saves it to the database.
7. Flask returns the new listing as JSON.

### Update Listing

Route:

```text
PUT /api/listings/<listing_id>
```

Used by:

```text
SellerDashboard.jsx
```

This is used to mark a listing sold or active.

Ownership check:

```python
if listing.seller_id != user_id:
    return jsonify({"error": "You can only edit your own listings"}), 403
```

This is important. A seller must not be able to edit another seller's listings.

### Delete Listing

Route:

```text
DELETE /api/listings/<listing_id>
```

Also protected by ownership.

### Seller's Own Listings

Route:

```text
GET /api/listings/seller/me
```

Used by:

```text
SellerDashboard.jsx
```

It returns all listings for the logged-in seller, including active and sold listings.

## 9. Payments API

Payment routes are in `backend/routes/payments.py`.

This part connects your backend to Safaricom Daraja M-Pesa sandbox.

### STK Push Flow

Frontend:

```text
ListingDetail.jsx
-> api.stkPush()
-> POST /api/payments/stk-push
```

Backend route:

```python
@payments_bp.route("/stk-push", methods=["POST"])
@jwt_required()
def stk_push():
```

Step by step:

1. Buyer clicks Buy Now.
2. React validates and formats phone number.
3. React sends `listing_id` and `phone`.
4. Flask checks the user is logged in.
5. Flask checks the user role is `buyer`.
6. Flask checks the listing exists and is not sold.
7. Flask checks M-Pesa environment variables.
8. Flask gets an OAuth access token from Safaricom.
9. Flask sends STK Push request to Safaricom.
10. If Safaricom accepts, Flask creates a pending order.
11. React receives `order_id`.
12. React polls `/api/payments/status/<order_id>`.

### Why The Order Starts As Pending

When Safaricom accepts an STK Push request, that does not mean the buyer has paid yet.

It only means:

> The payment request was sent to the phone.

So your app creates:

```python
status="pending"
```

Later, Safaricom calls your callback URL and tells your backend whether payment succeeded or failed.

### M-Pesa Callback Flow

Route:

```text
POST /api/payments/callback
```

This route is called by Safaricom, not React.

In development, this callback must be public HTTPS, so you use ngrok:

```text
https://your-ngrok-url.ngrok-free.app/api/payments/callback
```

When payment succeeds:

1. Backend finds the order by `CheckoutRequestID`.
2. Backend updates order status to `completed`.
3. Backend stores M-Pesa receipt number.
4. Backend marks listing as `sold`.

When payment fails or is cancelled:

1. Backend marks order as `failed`.

The callback always returns a success response to Safaricom:

```python
return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200
```

That tells Safaricom:

> We received your callback.

### Payment Status Polling

Frontend:

```text
ListingDetail.jsx
```

calls:

```javascript
api.paymentStatus(orderId)
```

Backend:

```text
GET /api/payments/status/<order_id>
```

This lets React check whether the payment is still pending, completed, or failed.

### Buyer Orders

Route:

```text
GET /api/payments/my-orders
```

Used by:

```text
BuyerDashboard.jsx
```

It returns all orders for the logged-in buyer.

## 10. Frontend To Backend Connection

The main connection file is:

```text
src/api.js
```

This file creates one helper:

```javascript
async function request(endpoint, options = {}) {
```

It does four important things:

1. Reads the base backend URL.
2. Reads the JWT token from `localStorage`.
3. Sends the HTTP request with JSON headers.
4. Converts backend errors into JavaScript `Error` objects.

Base URL:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

So if `VITE_API_URL` is not set, React talks to:

```text
http://localhost:8000
```

Example API function:

```javascript
createListing: (body) =>
  request("/api/listings/", {
    method: "POST",
    body: JSON.stringify(body)
  })
```

This keeps React pages clean. Pages do not need to know all the `fetch()` details.

## 11. Main Data Flows

### Flow A: User Signup

```text
Signup.jsx
-> useAuth().register()
-> api.register()
-> POST /api/auth/register
-> User row created in database
-> JWT token returned
-> token saved in localStorage
-> user redirected to dashboard
```

### Flow B: User Login

```text
Login.jsx
-> useAuth().login()
-> api.login()
-> POST /api/auth/login
-> password hash checked
-> JWT token returned
-> token saved in localStorage
-> user redirected by role
```

### Flow C: Seller Creates Listing

```text
SellerDashboard.jsx form submit
-> api.createListing()
-> POST /api/listings/
-> JWT required
-> role must be seller
-> Listing row created
-> listing returned
-> React adds listing to state
```

### Flow D: Buyer Browses Listings

```text
Browse.jsx page load
-> api.getListings()
-> GET /api/listings/
-> backend returns active listings
-> React displays listing cards
```

### Flow E: Buyer Opens Listing Detail

```text
ListingDetail.jsx page load
-> api.getListing(id)
-> GET /api/listings/<id>
-> backend increments views
-> backend returns listing and related listings
-> React displays detail page
```

### Flow F: Buyer Starts Payment

```text
ListingDetail.jsx Buy Now
-> api.stkPush()
-> POST /api/payments/stk-push
-> JWT required
-> role must be buyer
-> backend calls Safaricom STK Push
-> pending Order row created
-> React receives order_id
-> React starts polling status
```

### Flow G: Safaricom Confirms Payment

```text
Safaricom
-> POST /api/payments/callback
-> backend finds order by checkout id
-> order becomes completed or failed
-> listing becomes sold if completed
-> React sees new status during polling
```

## 12. API Route Summary

| Method | Route | Protected | Who Uses It | Purpose |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | No | Developer/browser | Check backend is running |
| `POST` | `/api/auth/register` | No | Signup page | Create account |
| `POST` | `/api/auth/login` | No | Login page | Login and receive token |
| `GET` | `/api/auth/me` | Yes | Dashboards/listing detail | Get logged-in user |
| `GET` | `/api/listings/` | No | Browse/buyer dashboard | Get active listings |
| `GET` | `/api/listings/<id>` | No | Listing detail | Get one listing and related items |
| `POST` | `/api/listings/` | Yes, seller | Seller dashboard | Create listing |
| `PUT` | `/api/listings/<id>` | Yes, owner | Seller dashboard | Edit listing or status |
| `DELETE` | `/api/listings/<id>` | Yes, owner | Seller dashboard | Delete listing |
| `GET` | `/api/listings/seller/me` | Yes, seller | Seller dashboard | Get seller's listings |
| `POST` | `/api/payments/stk-push` | Yes, buyer | Listing detail | Start M-Pesa payment |
| `POST` | `/api/payments/callback` | No | Safaricom | Confirm payment result |
| `GET` | `/api/payments/status/<order_id>` | Yes, buyer owner | Listing detail | Poll payment status |
| `GET` | `/api/payments/my-orders` | Yes | Buyer dashboard | Get buyer orders |

## 13. What Is Still Required To Fully Finish The Backend

The current backend is a solid learning project. To make it fully finished, several things should be added.

### Must-Have Backend Improvements

1. Add `requirements.txt`

Right now, backend dependencies are listed in the README, but not locked in a backend requirements file.

Add:

```text
Flask
flask-cors
flask-sqlalchemy
flask-jwt-extended
python-dotenv
requests
werkzeug
```

2. Add database migrations

Current:

```python
db.create_all()
```

Better:

```text
Flask-Migrate + Alembic
```

Why? Because real apps need controlled database changes. If you add a column later, migrations track that safely.

3. Strengthen validation

Right now validation is mostly manual. Add stronger checks for:

| Data | Validation needed |
| --- | --- |
| email | Correct email format |
| password | Minimum length and strength |
| price | Positive number |
| role | Buyer/seller only |
| condition | Good/Fair/Broken only |
| status | Active/sold only |
| phone | Kenyan phone format |

4. Normalize email on registration

Login lowercases email, but registration currently saves the email after strip only.

Better:

```python
email = data["email"].lower().strip()
```

This avoids duplicate accounts like:

```text
Jane@Email.com
jane@email.com
```

5. Add better error handlers

Currently `get_or_404()` can return HTML-style errors. For APIs, return JSON consistently.

Add handlers for:

```text
404 Not Found
400 Bad Request
401 Unauthorized
403 Forbidden
500 Server Error
```

6. Add tests

Test at least:

| Area | Example tests |
| --- | --- |
| Auth | register, duplicate email, login wrong password |
| Listings | seller creates listing, buyer cannot create listing |
| Ownership | seller cannot edit another seller's listing |
| Payments | invalid phone, sold listing, missing M-Pesa config |

7. Add image upload

The model has:

```python
image_url
```

But the app does not yet upload images. A production version should support Cloudinary or another object storage provider.

8. Add refresh tokens or session strategy

Currently the app stores one JWT access token in `localStorage`.

For a more secure production app, consider:

| Option | Benefit |
| --- | --- |
| Short-lived access tokens | Limits damage if token leaks |
| Refresh tokens | Allows continued sessions |
| HttpOnly cookies | Protects token from JavaScript access |

9. Add role checks on dashboard routes in frontend

The backend protects sensitive actions, which is the most important part. The frontend should also redirect users away from dashboards they should not use.

10. Add pagination

`GET /api/listings/` currently returns all active listings.

Production should support:

```text
/api/listings/?page=1&limit=20
```

This keeps the app fast when listings grow.

## 14. Production Readiness Checklist

Before deploying this as a real production app, work through this checklist.

### Security

- Replace all default secrets.
- Use strong `SECRET_KEY` and `JWT_SECRET_KEY`.
- Do not commit `.env`.
- Use HTTPS.
- Add password length and strength rules.
- Add rate limiting for login and register.
- Add JSON error handlers.
- Consider HttpOnly cookie auth instead of `localStorage`.
- Configure CORS to allow only the deployed frontend domain.

### Database

- Move from SQLite to PostgreSQL for production.
- Add Flask-Migrate/Alembic migrations.
- Add indexes for common lookups like email, phone, status, category, and seller_id.
- Add cascade behavior or delete rules for related listings/orders.
- Add backups.

### Payments

- Store raw callback payloads for audit/debugging.
- Validate callback data carefully.
- Prevent double-processing the same payment callback.
- Add an admin way to reconcile payment status.
- Move from Safaricom sandbox URLs to production Daraja URLs when approved.
- Keep M-Pesa secrets in environment variables only.

### API Quality

- Add pagination.
- Add server-side filtering from the browse page.
- Add consistent response shapes.
- Add API documentation with request and response examples.
- Add versioning later if needed, for example `/api/v1/...`.

### Testing

- Add unit tests for helper functions like phone formatting.
- Add integration tests for auth and listings.
- Mock Safaricom requests in payment tests.
- Run tests before deployment.

### Deployment

- Add `requirements.txt`.
- Add a production WSGI server like Gunicorn.
- Set `FLASK_ENV`/debug correctly so production does not run with debug mode.
- Use a managed PostgreSQL database.
- Configure frontend `VITE_API_URL` to point to deployed backend.
- Configure backend `FRONTEND_URL` to the deployed frontend domain.
- Configure a real public M-Pesa callback URL.

## 15. Suggested Learning Path For You

Since you are coming from HTML, CSS, JavaScript, React, and now Python, study this backend in this order:

1. `backend/app.py`

Understand how the Flask app starts, how config works, and how blueprints are registered.

2. `backend/models.py`

Understand tables, columns, primary keys, foreign keys, and relationships.

3. `backend/routes/auth.py`

Understand JSON request bodies, validation, password hashing, JWT creation, and protected routes.

4. `src/api.js`

Understand how React sends requests and receives JSON.

5. `backend/routes/listings.py`

Understand CRUD: create, read, update, delete.

6. `backend/routes/payments.py`

Study this last. It is the most advanced because it includes third-party APIs, callbacks, tokens, and asynchronous payment status.

## 16. The Mental Model To Keep

When you are confused, ask these questions:

1. Which React component started the action?
2. Which function in `src/api.js` did it call?
3. Which Flask route receives that request?
4. Does the route require a JWT token?
5. Which model/table does the route read or write?
6. What JSON does Flask return?
7. How does React use that JSON to update the screen?

That is how experienced developers debug full-stack apps. We do not try to understand everything at once. We follow the data.

## 17. Small Next Steps

Good next backend tasks for you:

1. Add `requirements.txt`.
2. Normalize email during registration.
3. Add JSON error handlers for 404 and 500.
4. Add backend-side pagination for listings.
5. Add simple tests for auth and listing creation.
6. Add Cloudinary image upload.
7. Add Flask-Migrate.

If you can confidently explain and implement those, you will have crossed a big bridge from beginner backend to practical full-stack developer.
