import re


def is_email_valid(email):
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


def update_board(board):
    """Update board to paint enclosed cells.

    Args:
        board (2D Array): The board game.

    Returns:
        2D Array: The updated board.

    Explanation:
        The board is updated by checking if an empty cell is surrounded by cells of the same color.
        If an empty cell is surrounded by cells of the same color, it is painted with the same color.
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
                empty_cells = find_empty_cell(board, x, y)
                for empty_cell in empty_cells:
                    found_other_color = check_around_cells(
                        board, empty_cell[0], empty_cell[1], color=board[x][y]
                    )
                    if found_other_color:
                        board = color_cells(board, color=-1, cell=-2)
                    else:
                        board = color_cells(board, color=board[x][y], cell=-2)
    board = color_cells(board, color=0, cell=-1)
    return board


def find_empty_cell(board, x, y):
    """Return all empty cells around the given cell.

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


def check_around_cells(board, x, y, color):

    is_other_color = list()
    if x > 0:
        is_other_color.append(check_other_color(board, x - 1, y, color=color))
    if x < 4:
        is_other_color.append(check_other_color(board, x + 1, y, color=color))
    if y > 0:
        is_other_color.append(check_other_color(board, x, y - 1, color=color))
    if y < 4:
        is_other_color.append(check_other_color(board, x, y + 1, color=color))
    return any(is_other_color)


def color_cells(board, color, cell=0):
    for x in range(0, 5):
        for y in range(0, 5):
            if board[x][y] == cell:
                board[x][y] = color
    return board


def check_other_color(board, x, y, color):
    if board[x][y] == color:
        return False
    if (board[x][y] > 0 and board[x][y] != color) or (board[x][y] == -1):
        return True
    if board[x][y] == 0:
        board[x][y] = -2
    checked = []
    if x > 0 and board[x - 1][y] != -2:
        checked.append(check_other_color(board, x - 1, y, color))
    if x < 4 and board[x + 1][y] != -2:
        checked.append(check_other_color(board, x + 1, y, color))
    if y > 0 and board[x][y - 1] != -2:
        checked.append(check_other_color(board, x, y - 1, color))
    if y < 4 and board[x][y + 1] != -2:
        checked.append(check_other_color(board, x, y + 1, color))
    return any(checked)
