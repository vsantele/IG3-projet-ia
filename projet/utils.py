import re
import time
import logging as lg

from flask_login import current_user
from flask import current_app

from functools import wraps

from typing import List


def is_email_valid(email: str):
    """Check if an email is valid.

    Args:
        email (string): input Email.

    Returns:
        bool: `True` if the email is valid, `False` otherwise.
    """
    email.strip()
    return (
        re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email) is not None
    )


def fill_paddock(board: List[List[int]], size: int = 5):
    """Update board to paint enclosed cells.

    Args:
        board (2D Array): The board game.
        size (int, optional): size of the board. Defaults to 5.

    Returns:
        2D Array: The updated board.

    Explanation:
        The board is updated by checking if an empty cell is surrounded by cells
        of the same color.
        If an empty cell is surrounded by cells of the same color, it is painted
        with the same color.
        If an empty cell is surrounded by cells of different color, it is not painted.

    Board Value:
        0 : Empty cell
        1 : user 1's cell
        2 : user 2's cell
    Board Temp Value:
        -1: Cell not enclosed
        -2: Cell that has been checked and wait for an answer

    Exemple:
        INPUT:
        [[1, 0, 0, 1, 0],
         [1, 1, 1, 1, 0],
         [0, 0, 2, 2, 2],
         [0, 0, 2, 0, 0],
         [0, 0, 2, 2, 2]]

        OUTPUT:
        [[1, 1, 1, 1, 0],
         [1, 1, 1, 1, 0],
         [0, 0, 2, 2, 2],
         [0, 0, 2, 2, 2],
         [0, 0, 2, 2, 2]]
    """
    for x in range(0, size):
        for y in range(0, size):
            if board[x][y] > 0:
                empty_cells = _find_empty_cell(board, x, y, size)
                for empty_cell in empty_cells:
                    found_other_color = _check_around_cells(
                        board,
                        x=empty_cell[0],
                        y=empty_cell[1],
                        color=board[x][y],
                        size=size,
                    )
                    if found_other_color:
                        _color_cells(board, color_to=-1, color_from=-2)
                    else:
                        _color_cells(board, color_to=board[x][y], color_from=-2)
    _color_cells(board, color_to=0, color_from=-1, size=size)
    return board


def _find_empty_cell(board: List[List[int]], x: int, y: int, size: int = 5):
    """Return all empty cells around the given cell never checked.

    Args:
        board (2D Array): Board
        x (int): x coordinate of the cell
        y (int): y coordinate of the cell
        size (int, optional): size of the board. Defaults to 5.

    Returns:
        [List]: List of coordinates of empty cells in tuple.
    """
    empty_cells = []
    if x > 0 and board[x - 1][y] == 0:
        empty_cells.append((x - 1, y))
    if x < size - 1 and board[x + 1][y] == 0:
        empty_cells.append((x + 1, y))
    if y > 0 and board[x][y - 1] == 0:
        empty_cells.append((x, y - 1))
    if y < size - 1 and board[x][y + 1] == 0:
        empty_cells.append((x, y + 1))
    return empty_cells


def _check_around_cells(
    board: List[List[int]], x: int, y: int, color: int, size: int = 5
):
    """Start recursive function to check if there are cells of another color
    linked to the start cell by empty cells.

    Args:
        board (list): The board
        x (int): x coordinate of the cell
        y (int): y coordinate of the cell
        color (int): color of the given cell
        size (int, optional): size of the board. Defaults to 5.

    Returns:
        bool: `True` if there are cells of another color, `False` otherwise.
    """
    board[x][y] = -2
    is_other_color = []
    if x > 0:
        is_other_color.append(
            _check_other_color(board, x - 1, y, color=color, size=size)
        )
    if x < size - 1:
        is_other_color.append(
            _check_other_color(board, x + 1, y, color=color, size=size)
        )
    if y > 0:
        is_other_color.append(
            _check_other_color(board, x, y - 1, color=color, size=size)
        )
    if y < size - 1:
        is_other_color.append(
            _check_other_color(board, x, y + 1, color=color, size=size)
        )
    return any(is_other_color)


def _color_cells(
    board: List[List[int]], color_to: int, color_from: int = 0, size: int = 5
):
    """Color cells of the board from one color to another.

    Args:
        board (list): board
        color_to (int): final color
        color_from (int, optional): initial color. Defaults to 0.
        size (int, optional): size of the board. Defaults to 5.
    """
    for x in range(0, size):
        for y in range(0, size):
            if board[x][y] == color_from:
                board[x][y] = color_to


def _check_other_color(
    board: List[List[int]], x: int, y: int, color: int, size: int = 5
):
    """Recursive function to check if there are cells of another color
    linked to the start cell by empty cells. Mark the cells as checked (-2).

    Args:
        board (list): board
        x (int): x coordinate of the cell to check
        y (int): y coordinate of the cell to check
        color (int): color of the start cell
        size (int, optional): size of the board. Defaults to 5.

    Returns:
        bool: `True` if there are cells of another color, `False` otherwise.
    """
    if board[x][y] == color:
        return False
    if (board[x][y] > 0 and board[x][y] != color) or (board[x][y] == -1):
        return True
    if board[x][y] == 0:
        board[x][y] = -2
    checked = []
    if x > 0 and board[x - 1][y] != -2:
        checked.append(_check_other_color(board, x - 1, y, color))
    if x < size - 1 and board[x + 1][y] != -2:
        checked.append(_check_other_color(board, x + 1, y, color))
    if y > 0 and board[x][y - 1] != -2:
        checked.append(_check_other_color(board, x, y - 1, color))
    if y < size - 1 and board[x][y + 1] != -2:
        checked.append(_check_other_color(board, x, y + 1, color))
    return any(checked)


def is_movement_valid(board, player, player_pos, movement):
    """Check if the movement is valid.


    Args:
        board (List[List[int]]): board
        player (int): player
        movement (tuple): movement
    """
    x, y = player_pos
    dx, dy = movement
    return (
        x + dx >= 0
        and x + dx < len(board)
        and y + dy >= 0
        and y + dy < len(board)
        and board[y + dy][x + dx] in (0, player)
    )


def move_converted(move):
    """Convert direction to coordinates.

    Args:
        move (str): the word representing the direction

    Returns:
        tuple: the coordinates of the direction
    """
    if move in ("left", "l"):
        return (-1, 0)
    if move in ("right", "r"):
        return (1, 0)
    if move in ("up", "u"):
        return (0, -1)
    if move in ("down", "d"):
        return (0, 1)


def called(func):
    """Decorator to log when a function is called.

    Args:
        func (function): function to log
    """

    def wrapper(*args, **kwargs):
        lg.debug("{} called".format(func.__name__))
        return func(*args, **kwargs)

    return wrapper


def timer(func):
    """Decorator to log the time taken by a function"""

    def wrapper(*args, **kwargs):
        start = time.time() * 1000
        result = func(*args, **kwargs)
        end = time.time() * 1000
        lg.debug("{} took {} ms".format(func.__name__, end - start))
        return result

    return wrapper


def parse_users(users):
    """Parse the users to a list of tuples.

    Args:
        users (str): the users

    Returns:
        list: the list of tuples
    """
    return [user for user in users.split(";") if is_email_valid(user)]


def user_is_admin(user):
    """Check if the user is an admin.

    Args:
        user (User): the user

    Returns:
        bool: `True` if the user is an admin, `False` otherwise.
    """
    return user.is_authenticated and user.email in current_app.config["ADMIN_USERS"]


def admin_required(func):
    """Decorator to check if the user is an admin."""

    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not user_is_admin(current_user):
            return current_app.login_manager.unauthorized()
        return func(*args, **kwargs)

    return decorated_view


def beautify_board(board):
    """Beautify the board.

    Args:
        board (List[List[int]]): the board

    Returns:
        str: the board
    """
    return "\n".join([" ".join([str(cell) for cell in row]) for row in board])
