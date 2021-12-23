import os

from flask import Flask
from flask_login import LoginManager
import click

from .models import User, db, init_db
from .views import auth_bp, game_bp, admin_bp
from .utils import parse_users
from .train import start_train_ai
import logging as lg

# APP SETUP

app = Flask(__name__)
app.config.from_object("config")
app.config.update(
    {
        "SQLALCHEMY_DATABASE_URI": os.environ.get(
            "SQLALCHEMY_DATABASE_URI",
            app.config["SQLALCHEMY_DATABASE_URI"],
        ),
        "SQLALCHEMY_TRACK_MODIFICATIONS": os.environ.get(
            "SQLALCHEMY_TRACK_MODIFICATIONS",
            app.config["SQLALCHEMY_TRACK_MODIFICATIONS"],
        ),
        "SECRET_KEY": os.environ.get("SECRET_KEY", app.config["SECRET_KEY"]),
        "ADMIN_USERS": parse_users(os.environ.get("ADMIN_USERS", "")),
    }
)

if app.config["ENV"] == "development":
    lg.basicConfig(level=lg.DEBUG)

# IMPORT BLUEPRINT AND REGISTER


app.register_blueprint(game_bp)
app.add_url_rule("/", endpoint="index")

app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

# DB SETUP


app.app_context().push()
db.init_app(app)
db.create_all()

# SETUP LOGIN MANAGER

login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    """Used by the login manager to load a user from the database by their ID.

    Args:
        user_id (int): the User id

    Returns:
        User: The user with the given id
    """
    return User.query.get(int(user_id))


# CLI COMMANDS


@app.cli.command("init_db")
@click.argument("reset", type=bool, default=False)
def cmd_init_db(reset):
    """Command to initialize database with flask"""
    init_db(reset=reset)


@app.cli.command("train_ai")
@click.argument("nb_games", type=int, default=1000)
def cmd_start_train_ai(nb_games):
    """Command to start a training of the Aik"""
    for _ in start_train_ai(nb_games):
        pass
