from flask import Flask
from flask_login import LoginManager
from .models import db, init_db, User
from .views import game_bp, auth_bp

# APP SETUP

app = Flask(__name__)
app.config.from_object("config")

# IMPORT BLUEPRINT AND REGISTER


app.register_blueprint(game_bp)
app.add_url_rule("/", endpoint="index")

app.register_blueprint(auth_bp)

# DB SETUP


db.init_app(app)

# SETUP LOGIN MANAGER

login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# CLI COMMANDS


@app.cli.command("init_db")
def cmd_init_db():
    """Command to initialize database with flask"""
    init_db()
