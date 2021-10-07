from flask_sqlalchemy import SQLAlchemy
from .views import app
import logging as lg

db = SQLAlchemy(app)


def init_db():
    """Initialize Database"""
    db.drop_all()
    db.create_all()
    # TODO Add Models

    db.session.commit()
    lg.warning("Database initialized !")


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(40), nullable=False)

    user_password = db.Column(db.String(256), nullable=False)

    game = db.relationship("Game", backref="game", lazy=True)


class Game(db.Model):
    game_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)

    user_id_1 = db.Column(db.Integer, db.ForeignKey("user_id"), nullable=False)
    user_id_2 = db.Column(db.Integer, db.ForeignKey("user_id"), nullable=False)

    vs_ai = db.Column(db.Boolean, default=True)

    state = db.relationship("State", backref="state", lazy=True)


class State(db.Model):
    state_id = db.Column(db.Integer, primary_key=True)
    board = db.Column(db.String(256), nullable=False)
    pos_player1_X = db.Column(db.Integer, nullable=False)
    pos_player1_Y = db.Column(db.Integer, nullable=False)
    pos_player2_X = db.Column(db.Integer, nullable=False)
    pos_player2_Y = db.Column(db.Integer, nullable=False)

    game_id = db.Column(db.Integer, db.ForeignKey("game_id"), nullable=False)
