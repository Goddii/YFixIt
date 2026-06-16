# YFixIt

YFixIt is a marketplace for broken, second-hand, and repairable electronics. Sellers can create listings, manage item status, and remove listings. Buyers can browse available items, inspect listing details, contact sellers, and initiate an M-Pesa STK Push checkout through Safaricom Daraja sandbox APIs.

The project is a full-stack application:

- Frontend: React, Vite, React Router, Tailwind-style utility classes
- Backend: Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS
- Database: SQLite by default
- Payments: Safaricom Daraja M-Pesa Express/STK Push sandbox

## Features

- Buyer and seller account registration
- JWT-based login and authenticated API calls
- Role-aware dashboard routing
- Public listing browse page with search, filtering, price range, and sorting
- Listing detail page with seller contact actions
- Seller dashboard for:
  - Viewing seller-owned listings
  - Creating new listings
  - Marking listings sold or active
  - Deleting listings
  - Viewing listing stats
- Buyer dashboard for:
  - Available listings
  - Purchases/orders
  - Message placeholder
- M-Pesa STK Push checkout for buyers
- Payment callback route that marks completed orders and listings as sold

## Project Structure

```text
YFixIt/
├── backend/
│   ├── app.py                 # Flask app factory, CORS, JWT, blueprint registration
│   ├── models.py              # SQLAlchemy User, Listing, Order models
│   └── routes/
│       ├── auth.py            # Register, login, current user
│       ├── listings.py        # Listing CRUD and public browse/detail routes
│       └── payments.py        # M-Pesa STK Push, callback, order status
├── src/
│   ├── api.js                 # Frontend API helper
│   ├── App.jsx                # React routes
│   ├── main.jsx               # React entry point
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── AuthContextValue.js
│   │   └── useAuth.js
│   └── pages/
│       ├── Home.jsx
│       ├── Browse.jsx
│       ├── ListingDetail.jsx
│       ├── Login.jsx
│       ├── Signup.jsx
│       ├── BuyerDashboard.jsx
│       ├── SellerDashboard.jsx
│       └── NotFound.jsx
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## Prerequisites

Install these before running the app:

- Node.js and npm
- Python 3.12 or compatible Python 3 version
- A Python virtual environment
- Safaricom Daraja developer account for M-Pesa sandbox testing
- ngrok or another public HTTPS tunnel for Daraja callbacks during local development

## Environment Variables

Create a root `.env` file in the project root:

```env
SECRET_KEY=replace-with-a-flask-secret
JWT_SECRET_KEY=replace-with-at-least-32-random-characters
DATABASE_URL=sqlite:///yfixit.db
FRONTEND_URL=http://localhost:5173

MPESA_CONSUMER_KEY=your-daraja-sandbox-consumer-key
MPESA_CONSUMER_SECRET=your-daraja-sandbox-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-mpesa-express-sandbox-passkey
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/payments/callback
```

Notes:

- Flask loads the root `.env`, not `src/.env`.
- `JWT_SECRET_KEY` should be at least 32 characters for HS256.
- `MPESA_SHORTCODE=174379` is the common Daraja sandbox shortcode for M-Pesa Express.
- `MPESA_PASSKEY` must match the M-Pesa Express/Lipa Na M-Pesa Online sandbox shortcode.
- `MPESA_CALLBACK_URL` must be public HTTPS. `localhost` will not work for Daraja callbacks.
- Restart Flask every time you change `.env`.

Optional frontend env in `src/.env` or root `.env` with Vite naming:

```env
VITE_API_URL=http://localhost:8000
```

If this is omitted, the frontend defaults to `http://localhost:8000`.

## Installation

Install frontend dependencies:

```bash
npm install
```

Create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended python-dotenv requests werkzeug
```

There is currently no `requirements.txt` in the repository, so the command above is the source of truth for backend package installation.

## Running The App

Start the Flask backend from the `backend` folder:

```bash
cd backend
python3 app.py
```

The backend runs on:

```text
http://localhost:8000
```

Start the React frontend from the project root in a second terminal:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

## Database

The backend uses SQLite by default:

```env
DATABASE_URL=sqlite:///yfixit.db
```

Tables are created automatically in `backend/app.py` using:

```python
db.create_all()
```

Models:

- `User`: buyer/seller account data
- `Listing`: electronics listings owned by sellers
- `Order`: payment/order records created after STK Push initiation

If you need a fresh local database, stop Flask, delete the SQLite database file, then restart Flask. Do not delete database files if you need to keep test users/listings/orders.

## Main User Flows

### Seller Flow

1. Sign up with role `seller`.
2. Navigate to `/seller/dashboard`.
3. Create a listing with title, category, condition, price, location, and description.
4. Manage listings:
   - Mark active listing as sold
   - Relist sold listing
   - Delete listing

### Buyer Flow

1. Sign up or log in with role `buyer`.
2. Browse active listings at `/browse`.
3. Open a listing detail page.
4. Enter a valid Safaricom M-Pesa phone number.
5. Click Buy Now.
6. Complete the STK Push on the phone.
7. The frontend polls payment status until the order is completed or failed.

Accepted M-Pesa phone formats:

```text
07XXXXXXXX
01XXXXXXXX
7XXXXXXXX
2547XXXXXXXX
2541XXXXXXXX
```

The app normalizes them to Daraja format before sending:

```text
2547XXXXXXXX or 2541XXXXXXXX
```

## M-Pesa Daraja Setup

The backend currently uses the Daraja sandbox URLs:

```text
https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
```

That means all M-Pesa credentials must be sandbox credentials.

### Where To Get Daraja Values

From the Daraja Developer Portal:

- `MPESA_CONSUMER_KEY`: My Apps -> your sandbox app -> Consumer Key
- `MPESA_CONSUMER_SECRET`: My Apps -> your sandbox app -> Consumer Secret
- `MPESA_SHORTCODE`: use sandbox M-Pesa Express shortcode, usually `174379`
- `MPESA_PASSKEY`: M-Pesa Express / Lipa Na M-Pesa Online sandbox passkey

Do not use the Test Credentials page that generates a `SecurityCredential` for this STK Push flow. That page is for other M-Pesa APIs such as B2C-style credential encryption. STK Push needs the M-Pesa Express shortcode and passkey.

### Callback URL With ngrok

Daraja must be able to call your backend from the internet. In local development:

```bash
ngrok http 8000
```

Copy the HTTPS forwarding URL and set:

```env
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/payments/callback
```

Restart Flask after editing `.env`.

### Payment Lifecycle

1. Buyer clicks Buy Now.
2. Frontend calls:

   ```text
   POST /api/payments/stk-push
   ```

3. Backend validates buyer role, listing, phone number, and M-Pesa env vars.
4. Backend requests Daraja OAuth token.
5. Backend sends STK Push request.
6. If accepted, backend creates a pending `Order`.
7. Safaricom calls:

   ```text
   POST /api/payments/callback
   ```

8. Callback marks the order:
   - `completed` if payment succeeds
   - `failed` if cancelled or failed
9. Completed payment marks the listing as `sold`.
10. Frontend polls:

    ```text
    GET /api/payments/status/<order_id>
    ```

## API Reference

Base URL:

```text
http://localhost:8000
```

Authenticated routes require:

```http
Authorization: Bearer <jwt-token>
```

### Auth

#### Register

```http
POST /api/auth/register
```

Body:

```json
{
  "name": "Jane Buyer",
  "email": "jane@example.com",
  "phone": "0712345678",
  "password": "password123",
  "role": "buyer"
}
```

`role` must be `buyer` or `seller`.

#### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

#### Current User

```http
GET /api/auth/me
```

Requires JWT.

### Listings

#### Browse Active Listings

```http
GET /api/listings/
```

Optional query params:

```text
category=Phones
condition=Broken
location=Nairobi
max_price=5000
search=samsung
sort=newest | price-asc | price-desc
```

#### Listing Detail

```http
GET /api/listings/<listing_id>
```

Increments the listing view count and returns related listings.

#### Create Listing

```http
POST /api/listings/
```

Requires seller JWT.

Body:

```json
{
  "title": "Samsung S21 cracked screen",
  "description": "Screen is cracked but phone powers on.",
  "price": 2500,
  "category": "Phones",
  "condition": "Broken",
  "location": "Nairobi",
  "image_url": "https://optional-image-url.example/item.jpg"
}
```

#### Update Listing

```http
PUT /api/listings/<listing_id>
```

Requires owner seller JWT.

Useful body for marking sold:

```json
{
  "status": "sold"
}
```

Useful body for relisting:

```json
{
  "status": "active"
}
```

#### Delete Listing

```http
DELETE /api/listings/<listing_id>
```

Requires owner seller JWT.

#### Seller Listings

```http
GET /api/listings/seller/me
```

Requires seller JWT.

### Payments

#### Initiate STK Push

```http
POST /api/payments/stk-push
```

Requires buyer JWT.

Body:

```json
{
  "listing_id": 1,
  "phone": "0712345678"
}
```

#### Daraja Callback

```http
POST /api/payments/callback
```

Called by Safaricom. Must be public HTTPS in development via ngrok or similar.

#### Payment Status

```http
GET /api/payments/status/<order_id>
```

Requires buyer JWT and only returns the buyer's own order.

#### Buyer Orders

```http
GET /api/payments/my-orders
```

Requires buyer JWT.

## Frontend Routes

```text
/                  Home
/login             Login
/signup            Signup
/browse            Browse active listings
/listing/:id       Listing detail and checkout
/buyer/dashboard   Buyer dashboard
/seller/dashboard  Seller dashboard
/dashboard         Seller dashboard alias
/*                 Not found
```

## Development Commands

Frontend:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Backend:

```bash
cd backend
python3 app.py
python3 -m py_compile routes/payments.py
```

## Troubleshooting

### Port 8000 Is Already In Use

If you stopped Flask with `Ctrl+Z`, it is paused rather than closed. In that terminal:

```bash
jobs
fg
```

Then press `Ctrl+C`.

After that restart Flask:

```bash
cd backend
python3 app.py
```

### 401 From `/api/auth/me`

Usually means the JWT in `localStorage` is missing, expired, or signed with an old `JWT_SECRET_KEY`.

Fix:

1. Log out or clear browser local storage.
2. Log in again.
3. If you changed `JWT_SECRET_KEY`, restart Flask.

### M-Pesa Says Wrong Credentials

Common causes:

- Using production credentials against sandbox URLs.
- Mixing consumer key/secret from one Daraja app with shortcode/passkey from another product.
- Wrong `MPESA_PASSKEY`.
- Flask is still running with old `.env` values because it was not restarted.

For this codebase, use sandbox credentials because the URLs point to `sandbox.safaricom.co.ke`.

### STK Push Returns 400

Check:

- Buyer is logged in, not seller.
- Phone number is valid Safaricom format.
- Listing is not already sold.
- M-Pesa env vars are present.
- `MPESA_CALLBACK_URL` is public HTTPS.
- Flask was restarted after `.env` edits.

The backend returns Daraja `details` where available, and the frontend displays those details.

### Callback Does Not Update Order

Check:

- ngrok is running.
- `MPESA_CALLBACK_URL` points to `/api/payments/callback`.
- The callback URL is HTTPS.
- Flask is running on port `8000`.
- Your ngrok URL did not expire/change after restarting ngrok.

### JWT Secret Warning

If you see an `InsecureKeyLengthWarning`, make `JWT_SECRET_KEY` at least 32 random characters:

```env
JWT_SECRET_KEY=replace-this-with-a-long-random-secret-value
```

Restart Flask after changing it. Existing tokens will become invalid, so log in again.

## Security Notes

- Do not commit `.env` with real secrets.
- Use long random values for Flask and JWT secrets.
- Use production Daraja credentials only against production URLs.
- In production, replace SQLite with a managed database.
- Add migrations before production use.
- Add server-side rate limiting for auth and payments.
- Validate uploaded media before adding real image upload support.

## Current Limitations

- No file upload pipeline yet; `image_url` is optional.
- No database migrations.
- Buyer messaging is a placeholder.
- Checkout uses Daraja sandbox endpoints.
- Payment polling is frontend-driven.
- There is no admin dashboard.
- There is no automated backend test suite yet.

## Suggested Next Steps

- Add `requirements.txt`.
- Add database migrations with Flask-Migrate.
- Add backend tests for auth, listings, and payments.
- Add real image upload with Cloudinary or S3.
- Add seller payout flow.
- Add order detail pages and receipts.
- Add production Daraja configuration switch.
- Add deployment instructions for Render, Railway, Fly.io, or similar.

