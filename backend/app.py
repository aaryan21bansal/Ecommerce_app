from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from bson.objectid import ObjectId
import pytz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

app.config["MONGO_URI"] = "mongodb://localhost:27017/ecommerce_db"
app.config['SECRET_KEY'] = 'your_secret_key_here'

mongo = PyMongo(app)

products_collection = mongo.db.products
users_collection = mongo.db.users
orders_collection = mongo.db.orders

def is_valid_objectid(oid):
    try:
        ObjectId(oid)
        return True
    except Exception:
        return False

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = data.get('user_id')
            if not user_id or not is_valid_objectid(user_id):
                return jsonify({"message": "Invalid token data"}), 401

            current_user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not current_user:
                return jsonify({"message": "User not found"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        except Exception as e:
            return jsonify({"message": f"Token error: {str(e)}"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.get('is_admin', False):
            return jsonify({"message": "Admin access required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
def home():
    return jsonify({"message": "Welcome to your E-commerce backend!"})

@app.route('/api/products', methods=['GET'])
def get_products():
    products = list(products_collection.find())
    for product in products:
        product["_id"] = str(product["_id"])
    return jsonify(products), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password required"}), 400

    if users_collection.find_one({"email": data['email']}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = generate_password_hash(data['password'])
    users_collection.insert_one({
        "email": data['email'],
        "password": hashed_password,
        "name": data.get('name', ''),
        "is_admin": data.get('is_admin', False)
    })
    return jsonify({"message": "User created"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password required"}), 400

    user = users_collection.find_one({"email": data['email']})
    if not user:
        return jsonify({"message": "Invalid email"}), 401
    if not check_password_hash(user['password'], data['password']):
        return jsonify({"message": "Invalid password"}), 401

    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    if isinstance(token, bytes):
        token = token.decode('utf-8')

    return jsonify({"token": token}), 200

@app.route('/api/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user.get("name", ""),
        "is_admin": current_user.get("is_admin", False)
    }), 200

@app.route('/api/orders', methods=['POST'])
@token_required
def create_order(current_user):
    data = request.get_json()
    required_fields = ['fullName', 'address', 'phone', 'paymentMethod', 'items', 'total']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing checkout information"}), 400

    enriched_items = []
    for item in data['items']:
        product_id = item.get('productId')
        quantity = item.get('quantity', 1)

        if not product_id or not is_valid_objectid(product_id):
            continue

        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            continue

        enriched_items.append({
            "productId": ObjectId(product_id),
            "name": product.get("name", "Unnamed Product"),
            "price": product.get("price", 0),
            "quantity": quantity
        })

    order = {
        "user_id": str(current_user['_id']),
        "fullName": data['fullName'],
        "address": data['address'],
        "phone": data['phone'],
        "paymentMethod": data['paymentMethod'],
        "items": enriched_items,
        "total": data['total'],
        "status": "Pending",
        "created_at": datetime.datetime.now(pytz.utc)
    }

    orders_collection.insert_one(order)
    return jsonify({"message": "Order placed successfully"}), 201

@app.route('/api/orders', methods=['GET'])
@token_required
def get_user_orders(current_user):
    user_id = str(current_user['_id'])
    orders = list(orders_collection.find({"user_id": user_id}))

    ist = pytz.timezone('Asia/Kolkata')

    for order in orders:
        order['_id'] = str(order['_id'])
        order['user_id'] = str(order['user_id'])

        if 'created_at' in order and isinstance(order['created_at'], datetime.datetime):
            ist_time = order['created_at'].astimezone(ist)
            order['created_at'] = ist_time.strftime('%Y-%m-%d %H:%M:%S')

        for item in order.get('items', []):
            if 'productId' in item:
                item['productId'] = str(item['productId'])

    return jsonify(orders), 200


@app.route('/api/admin/products', methods=['POST'])
@token_required
@admin_required
def add_product(current_user):
    data = request.get_json()
    if not data or 'name' not in data or 'price' not in data or 'category' not in data:
        return jsonify({"message": "Product name, price, and category are required"}), 400

    product = {
        "name": data['name'],
        "price": data['price'],
        "category": data['category'],  
        "imageUrl": data.get('imageUrl', ''),
        "description": data.get('description', '')
    }
    products_collection.insert_one(product)
    return jsonify({"message": "Product added"}), 201

@app.route('/api/admin/products/<product_id>', methods=['PUT'])
@token_required
@admin_required
def edit_product(current_user, product_id):
    if not is_valid_objectid(product_id):
        return jsonify({"message": "Invalid product ID"}), 400

    data = request.get_json()
    update_data = {}
    if 'name' in data:
        update_data['name'] = data['name']
    if 'price' in data:
        update_data['price'] = data['price']
    if 'category' in data:   
        update_data['category'] = data['category']
    if 'imageUrl' in data:
        update_data['imageUrl'] = data['imageUrl']
    if 'description' in data:
        update_data['description'] = data['description']

    if not update_data:
        return jsonify({"message": "No fields to update"}), 400

    result = products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        return jsonify({"message": "Product not found"}), 404
    return jsonify({"message": "Product updated"}), 200

@app.route('/api/admin/products/<product_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_product(current_user, product_id):
    if not is_valid_objectid(product_id):
        return jsonify({"message": "Invalid product ID"}), 400

    result = products_collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        return jsonify({"message": "Product not found"}), 404
    return jsonify({"message": "Product deleted"}), 200

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product_by_id(product_id):
    try:
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"message": "Product not found"}), 404

        product["_id"] = str(product["_id"])
        return jsonify(product), 200
    except Exception:
        return jsonify({"message": "Invalid product ID"}), 400

@app.route('/api/recommend', methods=['GET'])
def recommend_products():
    product_id = request.args.get('product_id')
    if not product_id or not is_valid_objectid(product_id):
        return jsonify([]), 400

    target_product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not target_product:
        return jsonify([]), 404

    all_products = list(products_collection.find())
    if len(all_products) <= 1:
        return jsonify([]), 200

    product_texts = [
        (str(product["_id"]), f"{product.get('name', '')} {product.get('category', '')} {product.get('description', '')}")
        for product in all_products
    ]

    ids, texts = zip(*product_texts)

    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(texts)

    try:
        target_index = ids.index(str(target_product["_id"]))
    except ValueError:
        return jsonify([]), 404

    cosine_similarities = cosine_similarity(tfidf_matrix[target_index], tfidf_matrix).flatten()

    similar_indices = cosine_similarities.argsort()[-5:][::-1]  
    similar_indices = [i for i in similar_indices if i != target_index][:4]  

    recommended_products = [all_products[i] for i in similar_indices]

    for prod in recommended_products:
        prod['_id'] = str(prod['_id'])

    return jsonify(recommended_products), 200


if __name__ == '__main__':
    app.run(debug=True)
