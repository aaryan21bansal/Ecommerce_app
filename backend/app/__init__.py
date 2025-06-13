from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS

mongo = PyMongo()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app)

    from backend_app.routes.orders import orders_bp
    from backend_app.routes.recommend import recommend_bp
    from .routes import auth, products
    app.register_blueprint(auth.bp)
    app.register_blueprint(products.bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(recommend_bp, url_prefix='/api')
    return app
