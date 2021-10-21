import re


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


def fill_paddock(board: list):
    """Update board to paint enclosed cells.

    Args:
        board (2D Array): The board game.

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
    for x in range(0, 5):
        for y in range(0, 5):
            if board[x][y] > 0:
                empty_cells = _find_empty_cell(board, x, y)
                for empty_cell in empty_cells:
                    found_other_color = _check_around_cells(
                        board, empty_cell[0], empty_cell[1], color=board[x][y]
                    )
                    if found_other_color:
                        board = _color_cells(board, color=-1, cell=-2)
                    else:
                        board = _color_cells(board, color=board[x][y], cell=-2)
    board = _color_cells(board, color=0, cell=-1)
    return board


def _find_empty_cell(board: list, x: int, y: int):
    """Return all empty cells around the given cell never checked.

    Args:
        board (2D Array): Board
        x (int): x coordinate of the cell
        y (int): y coordinate of the cell

    Returns:
        [List]: List of coordinates of empty cells in tuple.
    """
    empty_cells = []
    if x > 0 and board[x - 1][y] == 0:
        empty_cells.append((x - 1, y))
    if x < 4 and board[x + 1][y] == 0:
        empty_cells.append((x + 1, y))
    if y > 0 and board[x][y - 1] == 0:
        empty_cells.append((x, y - 1))
    if y < 4 and board[x][y + 1] == 0:
        empty_cells.append((x, y + 1))
    return empty_cells


def _check_around_cells(board: list, x: int, y: int, color: int):
    """Start recursive function to check if there are cells of another color
    linked to the start cell by empty cells.

    Args:
        board (list): The board
        x (int): x coordinate of the cell
        y (int): y coordinate of the cell
        color (int): color of the given cell

    Returns:
        bool: `True` if there are cells of another color, `False` otherwise.
    """
    is_other_color = []
    if x > 0:
        is_other_color.append(_check_other_color(board, x - 1, y, color=color))
    if x < 4:
        is_other_color.append(_check_other_color(board, x + 1, y, color=color))
    if y > 0:
        is_other_color.append(_check_other_color(board, x, y - 1, color=color))
    if y < 4:
        is_other_color.append(_check_other_color(board, x, y + 1, color=color))
    return any(is_other_color)


def _color_cells(board: list, color: int, cell: int = 0):
    """Color cells of the board from one color to another.

    Args:
        board (list): board
        color (int): final color
        cell (int, optional): initial color. Defaults to 0.

    Returns:
        list: the updated board.
    """
    for x in range(0, 5):
        for y in range(0, 5):
            if board[x][y] == cell:
                board[x][y] = color
    return board


def _check_other_color(board: list, x: int, y: int, color: int):
    """Recursive function to check if there are cells of another color
    linked to the start cell by empty cells. Mark the cells as checked.

    Args:
        board (list): board
        x (int): x coordinate of the cell to check
        y (int): y coordinate of the cell to check
        color (int): color of the start cell

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
    if x < 4 and board[x + 1][y] != -2:
        checked.append(_check_other_color(board, x + 1, y, color))
    if y > 0 and board[x][y - 1] != -2:
        checked.append(_check_other_color(board, x, y - 1, color))
    if y < 4 and board[x][y + 1] != -2:
        checked.append(_check_other_color(board, x, y + 1, color))
    return any(checked)


# check_direction
# return a boolean if the direction is usable
# in the position of the player
def validation_and_move(board, pos_y, pos_x, move):
    if move == "left":
        is_valid = pos_x > 1 and board[pos_y][pos_x - 1] != 2
        if is_valid:
            return is_valid, pos_y, pos_x - 1
    elif move == "right":
        is_valid = pos_x < 4 and board[pos_y][pos_x + 1] != 2
        if is_valid:
            return is_valid, pos_y, pos_x + 1
    elif move == "up":
        is_valid = pos_y > 1 and board[pos_y - 1][pos_x] != 2
        if is_valid:
            return is_valid, pos_y - 1, pos_x
    elif move == "down":
        is_valid = pos_y < 4 and board[pos_y + 1][pos_x] != 2
        if is_valid:
            return is_valid, pos_y + 1, pos_x
