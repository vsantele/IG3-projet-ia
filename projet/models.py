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


def init_db(reset=False):
    """Initialize Database"""
    if reset:
        db.drop_all()
    db.create_all()

    if reset and current_app.config["ENV"] == "development":
        lg.info("Creating default users")
        # Add test user
        user = User(
            name="test", email="test@test.be", password=generate_password_hash("test")
        )
        db.session.add(user)

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
    """Auto-incrementing primary key"""
    email = db.Column(db.String(100), nullable=False, unique=True)
    """email of the user"""
    name = db.Column(db.String(40), nullable=False)
    """name of the user"""
    password = db.Column(db.String(256), nullable=False)
    """hashed password of the user"""
    is_human = db.Column(db.Boolean, nullable=False, default=True)
    """True if user is human, False if user is a bot"""

    games = db.relationship("Game", backref="game", lazy=True)
    """Games played by the user. Read only"""

    @property
    def is_admin(self):
        """True if user is admin, False otherwise.
        To add admin user: add his email in ADMIN_USERS env variable

        Read only
        """
        return self.email in current_app.config["ADMIN_USERS"]

    @property
    def nb_game_played(self):
        """The number of game played by the user. Read only"""
        return len(self.games)

    @property
    def nb_game_win(self):
        """The number of game won by the user. Read only"""
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
    """Size of the board"""
    id = db.Column(db.Integer, primary_key=True)
    """Auto-incrementing primary key"""
    datetime = db.Column(db.Date, nullable=False, default=date.today())
    """Creation date of the game"""

    user_id_1 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    """User 1's id"""
    # user_id_2 = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)

    vs_ai = db.Column(db.Boolean, default=True)
    """True if user 2 is an AI, False otherwise"""

    # TODO: Check syntax
    # user_1 = db.relationship("User", foreign_keys=[user_id_1], backref="user_1")
    # user_2 = db.relationship("User", foreign_keys=[user_id_2], backref="user_2")

    board = db.Column(
        db.String(256), nullable=False, default="1000000000000000000000002"
    )
    """Board's state in string format. 0 = empty, 1 = player 1, 2 = player 2`"""
    pos_player_1_x = db.Column(db.Integer, nullable=False, default=0)
    """X position of player 1"""
    pos_player_1_y = db.Column(db.Integer, nullable=False, default=0)
    """Y position of player 1"""
    pos_player_2_x = db.Column(db.Integer, nullable=False, default=4)
    """X position of player 2"""
    pos_player_2_y = db.Column(db.Integer, nullable=False, default=4)
    """Y position of player 2"""

    current_player = db.Column(
        db.Integer,
        db.CheckConstraint(r"current_player IN (1, 2)"),
        nullable=False,
        default=1,
    )
    """Number of the player who's turn it is"""

    @classmethod
    def board_to_array(cls, board):
        """Convert board to double array"""
        return [
            [int(board[x * cls.size + y]) for y in range(0, cls.size)]
            for x in range(0, cls.size)
        ]

    @staticmethod
    def board_to_string(board):
        """Convert board to string"""
        return "".join([str(cell) for row in board for cell in row])

    @property
    def board_array(self):
        """Convert board to double array"""
        return self.board_to_array(self.board)

    def _update_board(self, x, y, value):
        """Update board with a color at a position"""
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
        """Return the player 1 's position

        Returns:
            tuple: (x, y)
        """
        return self.pos_player_1_x, self.pos_player_1_y

    @pos_player_1.setter
    def pos_player_1(self, pos):
        """Set the player 1 's position

        Args:
            pos (tuple): (x, y)
        """
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
        """Return the player 2 's position

        Returns:
            tuple: (x, y)
        """
        return self.pos_player_2_x, self.pos_player_2_y

    @pos_player_2.setter
    def pos_player_2(self, pos):
        """Set the player 2 's position

        Args:
            pos (tuple): (x, y)
        """
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


class Qtable(db.Model):
    """
    Qtable model

    Args:
        state (str): this is the state of the current game, contain:
            board(25), pos_player_1(2), pos_player_2(2), and turn(1)
            => 30 caracters => "100000000000000000000000200441" for ex
        up (int): value of the quality for this direction at this state
        down (int): value of the quality for this direction at this state
        left (int): value of the quality for this direction at this state
        right (int): value of the quality for this direction at this state
    """

    state = db.Column(db.String(30), primary_key=True)
    """State of the current game in a string"""
    up = db.Column(db.Float, nullable=False, default=0)
    """Value of the quality for up direction at this state"""
    down = db.Column(db.Float, nullable=False, default=0)
    """Value of the quality for down direction at this state"""
    left = db.Column(db.Float, nullable=False, default=0)
    """Value of the quality for left direction at this state"""
    right = db.Column(db.Float, nullable=False, default=0)
    """Value of the quality for right direction at this state"""

    def get_quality(self, action):
        """
        Return the quality of the action

        Args:
            action (str): the action to get the quality

        Raises:
            InvalidActionException: if the action is not valid (up, down, left, right)

        Returns:
            int: the quality of the action
        """
        if action in ("u", "up"):
            return self.up
        if action in ("d", "down"):
            return self.down
        if action in ("l", "left"):
            return self.left
        if action in ("r", "right"):
            return self.right
        raise InvalidActionException(action)

    def set_quality(self, action, reward):
        """
        Set the reward of the action

        Args:
            action (str): the action to set the reward
            reward (float): the reward to set

        Raises:
            InvalidActionException: if the action is not valid (up, down, left, right)
        """
        if action in ("u", "up"):
            self.up = reward
        elif action in ("d", "down"):
            self.down = reward
        elif action in ("l", "left"):
            self.left = reward
        elif action in ("r", "right"):
            self.right = reward
        else:
            raise InvalidActionException(action)

    def max(self, valid_movements=None):
        """
        Return the max reward for the given valid moves.
        If no valid moves are given, return the max quality for all the actions.

        Args:
            valid_movements (list): list of valid movements.
                Default is ["u", "d", "l", "r"]

        Returns:
            float: the max quality of the action
        """
        if valid_movements is None:
            valid_movements = ["u", "d", "l", "r"]
        available_reward = []
        for mouv in valid_movements:
            available_reward.append(self.get_quality(mouv))
        return max(available_reward)

    def best(self, valid_movements=None):
        """
        Return the best action

        Args:
            valid_movements (list, optional): List of all valid moves.
                Defaults to ["u", "d", "l", "r"].

        Returns:
            str: the best action
        """
        if valid_movements is None:
            valid_movements = ["u", "d", "l", "r"]
        max_reward = self.max(valid_movements)
        bests = []
        if "u" in valid_movements and self.up == max_reward:
            bests.append("u")
        if "d" in valid_movements and self.down == max_reward:
            bests.append("d")
        if "l" in valid_movements and self.left == max_reward:
            bests.append("l")
        if "r" in valid_movements and self.right == max_reward:
            bests.append("r")
        return random.choice(bests)


class History(db.Model):
    """Save last state for a gameId and player. Used for the AI"""

    game_id = db.Column(db.Integer, nullable=False)
    """Id of the game"""
    current_player = db.Column(db.Integer, nullable=False)
    """Number of the player who's turn it is"""
    state = db.Column(db.String(30), nullable=False)
    """State of the current game in a string"""
    movement = db.Column(
        db.String(1),
        db.CheckConstraint(r"movement IN ('u','d','l','r')"),
        nullable=False,
    )
    """Movement of the player (u, d, l, r)"""
    db.PrimaryKeyConstraint(game_id, current_player, name="history_pk")
