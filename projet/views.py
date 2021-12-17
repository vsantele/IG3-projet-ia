import logging as lg

from flask import (
    Blueprint,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    url_for,
    current_app,
    stream_with_context,
)
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from projet.utils import (
    is_email_valid,
    admin_required,
    user_is_admin,
    state_parsed,
    all_valid_movements,
)

from .ai import get_move, pos_player
from .exceptions import (
    GameFinishedException,
    InvalidMoveException,
    InvalidPositionException,
)
from .models import Game, Qtable, User, db
from .utils import move_converted, state_is_valid
from .train import start_train_ai, stop_train_ai

game_bp = Blueprint("game", __name__)
auth_bp = Blueprint("auth", __name__)
admin_bp = Blueprint("admin", __name__)

# MAIN ROUTE


@game_bp.route("/")
def index():
    """Root route"""
    # return "Hello world"
    return render_template("index.html", is_admin=user_is_admin(current_user))


@game_bp.route("/game", methods=["GET"])
@login_required
def game_create():
    """Create game

    Auth required
    """
    new_game = Game(user_id_1=current_user.id)
    db.session.add(new_game)
    db.session.commit()
    return redirect(url_for("game.game", game_id=new_game.id))


@game_bp.route("/user", methods=["GET"])
@login_required
def display_stat():
    """ """
    return render_template("stat.html")


@game_bp.route("/game/hint", methods=["GET"])
@login_required
def hint():
    movements = {"u": "up", "d": "down", "l": "left", "r": "right"}
    state = request.args.get("state")
    if state_is_valid(state):
        q_table_line = Qtable.query.get(state)
        if q_table_line is not None:
            board, pos_player1, *_ = state_parsed(state)
            return jsonify(
                move=movements[
                    q_table_line.best(
                        all_valid_movements(Game.board_to_array(board), 1, pos_player1)
                    )
                ]
            )
        res = jsonify(message="We can not help you in this case, sorry!")
        res.status = 500
        return res
    res = jsonify(message="State is not valid")
    res.status = 400
    return res


@game_bp.route("/game/<int:game_id>", methods=["GET", "POST"])
@login_required
def game(game_id):
    """Send game view and game state + handle move

    Auth required

    Args:
        game_id (int): the ID of the game
    """
    current_game = Game.query.get(game_id)
    if current_game is None:
        flash("Game not found")
        return redirect(url_for("game.index"))
    if current_game.user_id_1 != current_user.id:
        flash("You are not allowed to join this game.")
        return redirect(url_for("game.index"))
    if request.method == "POST":
        if current_game.is_finished:
            res = jsonify(message="The game is finished.")
            res.status = 400
            return res

        # read the JSON
        body = request.get_json()
        if body is None or "movement" not in body:
            res = jsonify(message="Request is not valid.")
            res.status = 400
            return res

        direction = body["movement"]
        if direction not in ("left", "right", "up", "down"):
            res = jsonify(message="Unknow Movement")
            res.status = 400
            return res

        move = move_converted(direction)

        try:
            current_game.move(move, 1)
        except InvalidMoveException:
            res = jsonify(message="Unknown Movement")
            res.status = 400
            return res
        except InvalidPositionException:
            res = jsonify(message="Movement is not valid")
            res.status = 400
            return res
        except Exception as e:
            lg.error(e)
            res = jsonify(message="Unknown Error")
            res.status = 500
            return res

        if current_game.vs_ai:
            # AI MOVE
            while True:
                try:
                    ai_move = get_move(current_game)
                    current_game.move(ai_move, 2)
                    break
                except GameFinishedException:
                    break
                # except Exception e:
                #     continue

        db.session.commit()

        return jsonify(
            board=current_game.board,
            players=[
                current_game.pos_player_1,
                current_game.pos_player_2,
            ],
            winner=current_game.winner,
        )

    return render_template(
        "game.html",
        game_state={
            "game_id": current_game.id,
            "board": current_game.board,
            "players": [
                list(current_game.pos_player_1),
                list(current_game.pos_player_2),
            ],
            "winner": current_game.winner,
        },
        name=current_user.name,
    )


# LOGIN ROUTE


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    """Login route"""
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
    """Signup route"""
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
    """Logout route

    Auth required
    """
    logout_user()
    return redirect(url_for("game.index"))


# ADMIN ROUTE


@admin_bp.route("/admin/dashboard", methods=["GET"])
@login_required
@admin_required
def dashboard():
    """
    Dashboard
    """
    return render_template("admin/dashboard.html")


@admin_bp.route("/admin/start", methods=["GET"])
@login_required
@admin_required
def start_train():
    """
    Start training
    """
    # TODO : update a template instead of print line in a text
    # https://flask.palletsprojects.com/en/2.0.x/patterns/streaming/#streaming-from-templates
    return current_app.response_class(
        stream_with_context(start_train_ai(n_games=100_000)), mimetype="text/plain"
    )


@admin_bp.route("/admin/stop", methods=["GET"])
@login_required
@admin_required
def stop_train():
    """
    Start training
    """
    stop_train_ai()
    flash("Training stopped")
    return redirect(url_for("admin.dashboard"))
