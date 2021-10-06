from flask_sqlalchemy import SQLAlchemy
from .views import app
import logging as lg

db = SQLAlchemy(app)


def init_db():
    """Initialize Database"""
    db.drop_all()
    db.create_all()
    # TODO Add Models

    victor = User(user_id=1, user_name="Victor", user_password="victorIA")
    joachim = User(user_id=2, user_name="Joachim", user_password="joachimIA")
    db.session.add(victor)
    db.session.add(joachim)
    game1 = Game(1, 1 / 10 / 2021, victor, joachim)
    db.session.add(game1)
    db.session.add(State(1, game1, victor, joachim, 0, 0, 5, 5))

    db.session.commit()
    lg.warning("Database initialized !")


class User(db.model):
    user_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(40), nullable=False)

    user_password = db.Column(db.String(256), nullable=False)

    game = db.relationship("Game", backref="game", lazy=True)

    def __init__(self, user_id, user_name, user_password):
        self.user_id = user_id
        self.user_name = user_name
        self.user_password = user_password


class Game(db.model):
    game_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)

    user_id_fk1 = db.Column(db.Integer, db.ForeignKey("user_id"), nullable=False)
    user_id_fk2 = db.Column(db.Integer, db.ForeignKey("user_id"), nullable=False)

    state = db.relationship("State", backref="state", lazy=True)

    def __init__(self, game_id, date, user_id_fk1, user_id_fk2):
        self.game_id = game_id
        self.date = date
        self.user_id_fk1 = user_id_fk1
        self.user_id_fk2 = user_id_fk2


class State(db.model):
    state_id = db.Column(db.Integer, primary_key=True)
    board = db.Column(db.String(256), nullable=False)
    pos_player1_X = db.Column(db.Integer, nullable=False)
    pos_player1_Y = db.Column(db.Integer, nullable=False)
    pos_player2_X = db.Column(db.Integer, nullable=False)
    pos_player2_Y = db.Column(db.Integer, nullable=False)

    game_id_fk = db.Column(db.Integer, db.ForeignKey("game_id"), nullable=False)

    def __init__(
        self,
        state_id,
        board,
        pos_player1_X,
        pos_player1_Y,
        pos_player2_X,
        pos_player2_Y,
    ):
        self.state_id = state_id
        self.board = board
        self.pos_player1_X = pos_player1_X
        self.pos_player1_Y = pos_player1_Y
        self.pos_player2_X = pos_player2_X
        self.pos_player2_Y = pos_player2_Y
