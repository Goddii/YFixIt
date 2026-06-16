from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime
import requests
import base64
import os
from models import db, Order, Listing


payments_bp = Blueprint("payments", __name__)


# helper get m-pesa oauth token
def get_mpesa_token():
    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
    credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
    response = requests.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        headers={"Authorization": f"Basic {credentials}"},
    )

    return response.json().get("access_token")


# helper  : format phone to 2547XXXXXXXX
def format_phone(phone):
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("0"):
        return "254" + phone[1:]
    if phone.startswith("+"):
        return phone[1:]
    return phone


# post /api/payments/stk-push
# buyer initiates payments sends stk push to their phone
@payments_bp.route("/stk-push", methods=["POST"])
@jwt_required()
def stk_push():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")

    if role != "buyer":
        return jsonify({"error": "Only buyers can initiate payments"}), 403

    data = request.get_json() or {}
    listing_id = data.get("listing_id")
    phone = data.get("phone")

    if not listing_id or not phone:
        return jsonify({"error": "listing_id and phone are required"}), 400

    listing = Listing.query.get_or_404(listing_id)

    if listing.status == "sold":
        return jsonify({"error": "This listing has already been sold"}), 400


    # build stk push request
    shortcode = os.getenv("MPESA_SHORTCODE", "174379")
    passkey = os.getenv("MPESA_PASSKEY")
    callback_url = os.getenv("MPESA_CALLBACK_URL")
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()
    amount = int(listing.price)
    phone = format_phone(phone)

    token = get_mpesa_token()
    if not token:
        return jsonify({"error": "Failed to get M-Pesa access token"}), 400

    stk_payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": shortcode,
        "PhoneNumber": phone,
        "CallBackURL": callback_url,
        "AccountReference": f"YFixIt-{listing.id}",
        "TransactionDesc": f"Payment for listing {listing.title[:20]}",
    }


    mpesa_response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=stk_payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        
        },
    )        

    mpesa_data = mpesa_response.json()

    # if safaricom accepted the request
    if mpesa_data.get("ResponseCode") == "0":
        # create pending order
        order = Order(
            listing_id=listing.id,
            buyer_id=user_id,
            amount=amount,
            status="pending",
            mpesa_checkout_id=mpesa_data.get("CheckoutRequestID"),
            phone=phone,
        )
        db.session.add(order)
        db.session.commit()

        return jsonify({
            "message": "STK Push initiated. Please complete the payment on your phone.",
            "order_id": order.id,
        }), 200

    # Safaricom rejected the request
    return jsonify({
        "error": "Failed to initiate payment",
        "details": mpesa_data,
    }), 400


# post /api/payments/callback
# safaricom calls this url after the buyer pays or cancels
#this must be publicly accessible (use ngrok in development)
@payments_bp.route("/callback", methods=["POST"])
def mpesa_callback():
    data = request.get_json() or {}
    body = data.get("Body", {})
    stk_callback = body.get("stkCallback", {})
    result = stk_callback.get("ResultCode")
    checkout_request_id = stk_callback.get("CheckoutRequestID")


    order = Order.query.filter_by(mpesa_checkout_id=checkout_request_id).first()

    if not order:
        # safaricom still expects a 200 response even if we can't find the order
        return jsonify({"ResultCode":0, "ResultDesc": "Accepted"}), 200


    if result == 0:
        #payment successful
        items = stk_callback.get("CallbackMetadata", {}).get("Item", [])
        receipt = next((i["Value"] for i in items if i["Name"] == "MpesaReceiptNumber"),None)

        order.status = "completed"
        order.mpesa_receipt = receipt

        # mark the listing as sold
        listing = Listing.query.get(order.listing_id)
        if listing:
            listing.status = "sold"

        db.session.commit()

    else:
        # payment failed or cancelled by user
        order.status = "failed"
        db.session.commit()

    return jsonify({"ResultCode":0, "ResultDesc": "Accepted"}), 200


# get /api/payments/status/<order_id>
#react polls this to know if payment went through
@payments_bp.route("/status/<int:order_id>", methods=["GET"])
@jwt_required()
def payment_status(order_id):
    user_id = int(get_jwt_identity())
    order = Order.query.get_or_404(order_id)

    if order.buyer_id != user_id:
        return jsonify({"error": "Unauthorised"}), 403

    return jsonify({"order": order.to_dict()}), 200


# get /api/payments/my-orders
# returns all orders for the logged-in buyer
@payments_bp.route("/my-orders", methods=["GET"])
@jwt_required()
def my_orders():
    user_id = int(get_jwt_identity())
    orders = Order.query.filter_by(buyer_id=user_id).order_by(Order.created_at.desc()).all()

    return jsonify({"orders": [o.to_dict() for o in orders]}), 200                           
