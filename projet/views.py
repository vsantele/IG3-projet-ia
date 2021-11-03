from flask import (
    Blueprint,
    Flask,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify,
)
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash

from projet.utils import is_email_valid, validation_and_move, fill_paddock

from .models import db, User, Game

from .ai import get_move

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
    """Create game

    Auth required
    """
    new_game = Game(user_id_1=current_user.id)
    db.session.add(new_game)
    db.session.commit()
    return redirect(url_for("game.game", game_id=new_game.id))


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

        # lire le JSOn
        body = request.get_json()
        if body is None or "movement" not in body:
            res = jsonify(message="Requête non valide")
            res.status = 400
            return res

        move = body["movement"]
        if move not in ("left", "right", "up", "down"):
            res = jsonify(message="Mouvment inconnu")
            res.status = 400
            return res

        # vérifier que le mouvement est valide par rapport au board
        board = current_game.board_array
        pos_x = current_game.pos_player1_X
        pos_y = current_game.pos_player1_Y
        is_autorised_move, new_pos_x, new_pos_y = validation_and_move(
            board, pos_x, pos_y, move, 2
        )

        # ajouter le move ds la partie
        if not is_autorised_move:
            res = jsonify(message="Mouvement non valide")
            res.status = 400
            return res
        # bouger le joueur
        current_game.pos_player1_X = new_pos_x
        current_game.pos_player1_Y = new_pos_y
        board[new_pos_y][
            new_pos_x
        ] = 1  # if you take that it 's the first and only player
        # update le board
        board = fill_paddock(board)

        if current_game.vs_ai:
            # AI MOVE
            ai_move = get_move(current_game)
            is_autorised_move, new_pos_AI_x, new_pos_AI_y = validation_and_move(
                board,
                current_game.pos_player2_X,
                current_game.pos_player2_Y,
                ai_move,
                1,
            )
            while not is_autorised_move:
                ai_move = get_move(current_game)
                is_autorised_move, new_pos_AI_x, new_pos_AI_y = validation_and_move(
                    board,
                    current_game.pos_player2_X,
                    current_game.pos_player2_Y,
                    ai_move,
                    1,
                )

            current_game.pos_player2_X = new_pos_AI_x
            current_game.pos_player2_Y = new_pos_AI_y
            board[new_pos_AI_y][new_pos_AI_x] = 2
            board = fill_paddock(board)

        # parser le board en string de stockage
        board_str = Game.board_to_string(board)

        # update current_board.board
        current_game.board = board_str

        # mettre à jour
        db.session.commit()
        # renvoyer un json avec les infos de jeux update
        return jsonify(
            board=board_str,
            players=[
                [new_pos_x, new_pos_y],
                [current_game.pos_player2_X, current_game.pos_player2_Y],
            ],
        )

    return render_template(
        "game.html",
        game_state={
            "game_id": current_game.id,
            "board": current_game.board,
            "players": [
                [current_game.pos_player1_X, current_game.pos_player1_Y],
                [current_game.pos_player2_X, current_game.pos_player2_Y],
            ],
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
