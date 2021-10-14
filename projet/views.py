from flask import Blueprint, Flask, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash

from projet.utils import is_email_valid

from .models import db, User, Game

game_bp = Blueprint("game", __name__)
auth_bp = Blueprint("auth", __name__)

# MAIN ROUTE


@game_bp.route("/")
def index():
    """Root route"""
    # return "Hello world"
    return render_template("index.html")


@game_bp.route("/game", methods=["GET"])
@login_required
def game_create():
    """Create game"""
    # TODO: add game creation + redirect /game/<game_id>
    game = Game(user_id_1=current_user.id)
    db.session.add(game)
    db.session.commit()
    return redirect(url_for("game.game", game_id=game.id))


@game_bp.route("/game/<int:game_id>", methods=["GET", "POST"])
@login_required
def game(game_id):
    """Send game view and game state + handle move

    Args:
        game_id (int): the ID of the game
    """
    game = Game.query.get(game_id)
    if game is None:
        flash("Game not found")
        return redirect(url_for("game.index"))
    if game.user_id_1 != current_user.id:
        flash("You are not allowed to join this game.")
        return redirect(url_for("game.index"))
    if request.method == "POST":
        # TODO: handle move
        pass
    return render_template(
        "game.html",
        game_state={
            "game_id": game.id,
            "board": game.board,
            "players": [[0, 0], [4, 4]],
        },
        name=current_user.name,
    )


# LOGIN ROUTE


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        remember = bool(request.form.get("remember"))

        if email is None or not is_email_valid(email):
            flash("Email is not valid.")
            return redirect(url_for("auth.login"))
        email = email.lower().strip()

        user = User.query.filter(User.email == email).first()

        if not user or not check_password_hash(user.password, password):
            flash("Please check your login details and try again.")
            return redirect(url_for("auth.login"))

        login_user(user, remember=remember)
        return redirect(url_for("game.index"))

    return render_template("login.html")


@auth_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        email = request.form.get("email")
        name = request.form.get("name")
        password = request.form.get("password")

        if email is None or not is_email_valid(email):
            flash("Email is not valid")
            return redirect(url_for("auth.signup"))
        if name is None:
            flash("Name is required")
            return redirect(url_for("auth.signup"))
        if password is None:
            flash("Password is required")
            return redirect(url_for("auth.signup"))

        email = email.lower().strip()

        user = User.query.filter_by(email=email).first()

        if user:
            flash("Email address already exists")
            return redirect(url_for("auth.signup"))

        new_user = User(
            email=email,
            name=name,
            password=generate_password_hash(password, method="pbkdf2:sha256"),
        )
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for("auth.login"))

    return render_template("signup.html")


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("game.index"))
