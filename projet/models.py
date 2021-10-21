from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
import logging as lg
from datetime import date
from werkzeug.security import generate_password_hash

db = SQLAlchemy()


def init_db():
    """Initialize Database"""
    db.drop_all()
    db.create_all()

    # Add test user
    user = User(
        name="test", email="test@test.be", password=generate_password_hash("test")
    )
    db.session.add(user)

    db.session.commit()
    lg.warning("Database initialized !")


class User(UserMixin, db.Model):
    """User Model

    Args:
        email (string): User's email
        name (string): User's name
        password (string): hashed User's password
        is_human (boolean): True if user is admin, False otherwise
    """

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    name = db.Column(db.String(40), nullable=False)
    password = db.Column(db.String(256), nullable=False)
    is_human = db.Column(db.Boolean, nullable=False, default=True)

    games = db.relationship("Game", backref="game", lazy=True)


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=date.today())

    # TODO: check how foreign_keys works with sqlalchemy
    user_id_1 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    # user_id_2 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    vs_ai = db.Column(db.Boolean, default=True)

    # TODO: Check syntax
    # user_1 = db.relationship("User", foreign_keys=[user_id_1], backref="user_1")
    # user_2 = db.relationship("User", foreign_keys=[user_id_2], backref="user_2")

    board = db.Column(
        db.String(256), nullable=False, default="1000000000000000000000002"
    )
    pos_player1_X = db.Column(db.Integer, nullable=False, default=0)
    pos_player1_Y = db.Column(db.Integer, nullable=False, default=0)
    pos_player2_X = db.Column(db.Integer, nullable=False, default=4)
    pos_player2_Y = db.Column(db.Integer, nullable=False, default=4)

    @staticmethod
    def board_to_string(board):
        """Convert board to string"""
        return "".join([str(cell) for row in board for cell in row])

    @property
    def board_array(self):
        """Convert board to array"""
        return [[int(self.board[x * 5 + y]) for y in range(0, 5)] for x in range(0, 5)]
