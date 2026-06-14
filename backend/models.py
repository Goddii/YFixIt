from app import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20),  unique=True, nullable=False)
    password   = db.Column(db.String(255), nullable=False) # stored as bcrypt hash
    role       = db.Column(db.String(10),  nullable=False) # buyer or seller
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 

    # relationships
    listings = db.relationship("Listing", backref="seller", lazy=True)
    orders   = db.relationship("Order",   backref="buyer",  lazy=True)

    def to_dict(self):
        return {
            "id" : self.id,
            "name" : self.name,
            "email" : self.email,
            "phone" : self.phone,
            "role" : self.role,
            "created_at" : self.created_at.isoformat()
        }


class Listings(db.Model):
    __tablename__ = "listings"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text,        nullable=False)
    price       = db.Column(db.Float,       nullable=False)
    category    = db.Column(db.String(50),  nullable=False)
    condition   = db.Column(db.String(20),  nullable=False)  # Good | Fair | Broken
    location    = db.Column(db.String(100), nullable=False)
    image_url   = db.Column(db.String(255), nullable=True)   # Cloudinary URL (Day 8)
    status      = db.Column(db.String(20),  default="active")# active | sold
    views       = db.Column(db.Integer,     default=0)
    created_at  = db.Column(db.DateTime,    default=datetime.utcnow)


    # foreign key which seller posted this
    seller_id = db.column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # relationships
    orders = db.relationship("Order", backref="listing", lazy=True)

    def to_dict(self):
        return {
            "id":          self.id,
            "title":       self.title,
            "description": self.description,
            "price":       self.price,
            "category":    self.category,
            "condition":   self.condition,
            "location":    self.location,
            "image_url":   self.image_url,
            "status":      self.status,
            "views":       self.views,
            "seller_id":   self.seller_id,
            "seller_name": self.seller.name if self.seller else None,
            "seller_phone":self.seller.phone if self.seller else None,
            "created_at":  self.created_at.isoformat(),
        }


class Order(db.Model):
    __tablename__ = "orders"


    id                  = db.Column(db.Integer, primary_key=True)
    amount              = db.Column(db.Float,      nullable=False)
    status              = db.Column(db.String(20), default="pending")  # pending | completed | failed
    mpesa_checkout_id   = db.Column(db.String(100), nullable=True)     # from Daraja STK push
    mpesa_receipt       = db.Column(db.String(100), nullable=True)     # from Daraja callback
    phone               = db.Column(db.String(20),  nullable=False)    # buyer phone for STK push
    created_at          = db.Column(db.DateTime,    default=datetime.utcnow

    #foreign keys
    buyer_id   = db.Column(db.Integer, db.ForeignKey("users.id"),    nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey("listings.id"), nullable=False)

    def to_dict(self):
        return {
            "id":                self.id,
            "amount":            self.amount,
            "status":            self.status,
            "mpesa_checkout_id": self.mpesa_checkout_id,
            "mpesa_receipt":     self.mpesa_receipt,
            "phone":             self.phone,
            "buyer_id":          self.buyer_id,
            "listing_id":        self.listing_id,
            "created_at":        self.created_at.isoformat(),
        }




