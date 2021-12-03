from flask import current_app
import logging as lg
from datetime import date
import random

from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

from .exceptions import (
    GameFinishedException,
    InvalidMoveException,
    InvalidPlayerException,
    InvalidPositionException,
    InvalidActionException,
)
from .utils import fill_paddock

db = SQLAlchemy()


def init_db():
    """Initialize Database"""
    db.drop_all()
    db.create_all()

    if current_app.config["ENV"] == "development":
        lg.info("Creating default users")
        # Add test user
        user = User(
            name="test", email="test@test.be", password=generate_password_hash("test")
        )
        db.session.add(user)

    ai = Ai()
    db.session.add(ai)

    db.session.commit()
    lg.info("Database initialized !")


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

    @property
    def is_admin(self):
        return self.email in current_app.config["ADMIN_USERS"]

    @property
    def nb_game_played(self):
        return len(self.games)

    @property
    def nb_game_win(self):
        return len(list(filter(lambda x: x.is_finished and x.winner == 1, self.games)))

class Game(db.Model):
    """
    Game Model

    Args:
        datetime (datetime): Creation date of the game
        user_id_1 (int): User 1's id
        vs_ai (boolean): True if user 2 is an AI, False otherwise
        # user_id_2 (int): User 2's id
        board (string): Board's state
        current_player (int): Number of the player who's turn it is
        pos_player1_X (int): X position of player 1
        pos_player1_Y (int): Y position of player 1
        pos_player2_X (int): X position of player 2
        pos_player2_Y (int): Y position of player 2
    """

    size = 5
    id = db.Column(db.Integer, primary_key=True)
    datetime = db.Column(db.Date, nullable=False, default=date.today())

    # TODO: check how foreign_keys works with sqlalchemy
    user_id_1 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    # user_id_2 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    vs_ai = db.Column(db.Boolean, default=True)

    # TODO: Check syntax
    # user_1 = db.relationship("User", foreign_keys=[user_id_1], backref="user_1")
    # user_2 = db.relationship("User", foreign_keys=[user_id_2], backref="user_2")

    board = db.Column(
        db.String(256), nullable=False, default="1000000000000000000000002"
    )
    pos_player_1_x = db.Column(db.Integer, nullable=False, default=0)
    pos_player_1_y = db.Column(db.Integer, nullable=False, default=0)
    pos_player_2_x = db.Column(db.Integer, nullable=False, default=4)
    pos_player_2_y = db.Column(db.Integer, nullable=False, default=4)

    current_player = db.Column(
        db.Integer,
        db.CheckConstraint(r"current_player IN (1, 2)"),
        nullable=False,
        default=1,
    )

    @staticmethod
    def board_to_string(board):
        """Convert board to string"""
        return "".join([str(cell) for row in board for cell in row])

    @property
    def board_array(self):
        """Convert board to double array"""
        return [
            [int(self.board[x * self.size + y]) for y in range(0, self.size)]
            for x in range(0, self.size)
        ]

    def _update_board(self, x, y, value):
        pos = y * 5 + x
        self.board = self.board[:pos] + str(value) + self.board[pos + 1 :]

    @property
    def is_finished(self):
        """Return if the game is finished

        Returns:
            bool: `True` if the game is finished, `False` otherwise.
        """
        return "0" not in self.board

    @property
    def winner(self):
        """Return the number of the winner.

        Returns:
            int: `0` if the game is not finished, `1` or `2` otherwise.
        """
        if not self.is_finished:
            return 0
        nb_cell_1 = self.board.count("1")
        nb_cell_2 = self.board.count("2")
        return 1 if nb_cell_1 > nb_cell_2 else 2

    @property
    def pos_player_1(self):
        """Return the player 1 's position"""
        return self.pos_player_1_x, self.pos_player_1_y

    @pos_player_1.setter
    def pos_player_1(self, pos):
        """Set the player 1 's position"""
        x, y = pos
        if (
            (x < 0 or x >= self.size)
            or (y < 0 or y >= self.size)
            or (self.board_array[y][x] not in (0, 1))
        ):
            raise InvalidPositionException(x, y)
        self.pos_player_1_x = x
        self.pos_player_1_y = y

    @property
    def pos_player_2(self):
        """Return the player 2 's position"""
        return self.pos_player_2_x, self.pos_player_2_y

    @pos_player_2.setter
    def pos_player_2(self, pos):
        """Set the player 2 's position"""
        x, y = pos
        if (
            (x < 0 or x >= self.size)
            or (y < 0 or y >= self.size)
            or (self.board_array[y][x] not in (0, 2))
        ):
            raise InvalidPositionException(x, y)
        self.pos_player_2_x = x
        self.pos_player_2_y = y

    def move(self, move, player):
        """Move the player and update the board

        Args:
            move (tuple): (x, y) of the move
            player (int): Number of the player who's turn it is
        """
        if self.is_finished:
            raise GameFinishedException()
        if any(x not in (0, 1, -1) for x in move):
            raise InvalidMoveException(move[0], move[1])
        if player not in (1, 2):
            raise InvalidPlayerException(player)
        x_move, y_move = move
        if player == 1:
            x, y = self.pos_player_1
            new_x, new_y = x + x_move, y + y_move
            self.pos_player_1 = new_x, new_y
            self._update_board(new_x, new_y, 1)
            self.current_player = 2
        else:
            x, y = self.pos_player_2
            new_x, new_y = x + x_move, y + y_move
            self.pos_player_2 = new_x, new_y
            self._update_board(new_x, new_y, 2)
            self.current_player = 1
        self.board = self.board_to_string(fill_paddock(self.board_array, self.size))
        db.session.commit()

    # def update_board(self, player, pos):
    #     """Update the board with the player's move

    #     Args:
    #         player (int): Number of the player who's turn it is
    #         pos (tuple): (x, y) of the player
    #     """
    #     if player not in (1, 2):
    #         raise InvalidPlayerException(player)
    #     if any(x not in (0, 1, -1) for x in pos):
    #         raise InvalidMoveException(pos[0], pos[1])

    #     if player == 1:
    #         self._update_board(self.board, pos, 1)
    #     else:
    #         self._update_board(self.board, pos, 2)


class Qtable(db.Model):
    """
    Qtable model

    Args :
        state (str): this is the state of the current game, contain board(25), pos_player_1(2), pos_player_2(2), and turn(1)
            => 30 caracters => "100000000000000000000000200441" for ex
        up (int): value of the reward for this direction at T time
        down (int): value of the reward for this direction at T time
        left (int): value of the reward for this direction at T time
        right (int): value of the reward for this direction at T time
    """

    state = db.Column(db.String(30), primary_key=True)
    up = db.Column(db.Float, nullable=False, default=0)
    down = db.Column(db.Float, nullable=False, default=0)
    left = db.Column(db.Float, nullable=False, default=0)
    right = db.Column(db.Float, nullable=False, default=0)

    def get_reward(self, action):
        """
        Return the reward of the action

        Args:
            action (str): the action to get the reward

        Returns:
            int: the reward of the action
        """
        if action == "u" or action == "up":
            return self.up
        elif action == "d" or action == "down":
            return self.down
        elif action == "l" or action == "left":
            return self.left
        elif action == "r" or action == "right":
            return self.right
        else:
            raise InvalidActionException(action)

    def set_reward(self, action, reward):
        """
        Set the reward of the action

        Args:
            action (str): the action to set the reward
            reward (float): the reward to set
        """
        if action == "u" or action == "up":
            self.up = reward
        elif action == "d" or action == "down":
            self.down = reward
        elif action == "l" or action == "left":
            self.left = reward
        elif action == "r" or action == "right":
            self.right = reward
        else:
            raise InvalidActionException(action)

    def max(self):
        """
        Return the max reward

        Returns:
            float: the max reward of the action
        """
        return max(self.up, self.down, self.left, self.right)

    def best(self, valid_movements=["u", "d", "l", "r"]):
        """
        Return the best action

        Args:
            valid_movements (list, optional): List of all valid moves. Defaults to ["u", "d", "l", "r"].

        Returns:
            str: the best action
        """
        max = self.max()
        bests = []
        if "u" in valid_movements and self.up == max:
            bests.append("u")
        elif "d" in valid_movements and self.down == max:
            bests.append("d")
        elif "l" in valid_movements and self.left == max:
            bests.append("l")
        elif "r" in valid_movements and self.right == max:
            bests.append("r")
        return random.choice(bests)


class History(db.Model):

    game_id = db.Column(db.Integer, nullable=False)
    current_player = db.Column(db.Integer, nullable=False)
    state = db.Column(db.String(30), nullable=False)
    movement = db.Column(
        db.String(1),
        db.CheckConstraint(r"movement IN ('u','d','l','r')"),
        nullable=False,
    )  # movement  = 'u' 'd' 'l' 'r'
    db.PrimaryKeyConstraint(game_id, current_player, name="history_pk")


class Ai(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    epsilon = db.Column(db.Float, nullable=False, default=0.9)
    learning_rate = db.Column(db.Float, nullable=False, default=0.1)
    discount_factor = db.Column(db.Float, nullable=False, default=0.5)
