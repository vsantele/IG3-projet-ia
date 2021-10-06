from flask import Flask, redirect, render_template, request, url_for

app = Flask(__name__)
app.config.from_object("config")


@app.route("/")
def index ():
    """Root route"""
    return render_template("index.html")


@app.route("/game", methods=["GET"])
def game_create():
    """Create game"""
    # TODO: add game creation + redirect /game/<game_id>
    return redirect(url_for("game", game_id=42))


@app.route("/game/<int:game_id>", methods=["GET", "POST"])
def game(game_id):
    """Send game view and game state + handle move

    Args:
        game_id (int): the ID of the game
    """

    if request.method == "POST":
        # TODO: handle move
        pass
    return render_template("game.html", game_state={"game_id": game_id})
