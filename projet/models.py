from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
import logging as lg

db = SQLAlchemy()


def init_db():
    """Initialize Database"""
    db.drop_all()
    db.create_all()
    db.session.commit()
    lg.warning("Database initialized !")


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    name = db.Column(db.String(40), nullable=False)
    password = db.Column(db.String(256), nullable=False)
    is_humain = db.Column(db.Boolean, nullable=False, default=True)

    games = db.relationship("Game", backref="game", lazy=True)


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)

    # TODO: check how foreign_keys works with sqlalchemy
    user_id_1 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    # user_id_2 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    vs_ai = db.Column(db.Boolean, default=True)

    # TODO: Check syntax
    # user_1 = db.relationship("User", foreign_keys=[user_id_1], backref="user_1")
    # user_2 = db.relationship("User", foreign_keys=[user_id_2], backref="user_2")

    board = db.Column(db.String(256), nullable=False)
    pos_player1_X = db.Column(db.Integer, nullable=False)
    pos_player1_Y = db.Column(db.Integer, nullable=False)
    pos_player2_X = db.Column(db.Integer, nullable=False)
    pos_player2_Y = db.Column(db.Integer, nullable=False)
