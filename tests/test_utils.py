import pytest
from projet.utils import (
    is_email_valid,
    fill_paddock,
    is_movement_valid,
    parse_users,
    beautify_board,
    move_converted,
)


@pytest.mark.parametrize(
    ("email", "is_valid"),
    [
        ("test@example.com", True),
        ("vic@test.wtf", True),
        ("@example.com", False),
        ("@test", False),
        ("test@", False),
        ("test@test.", False),
        ("", False),
        ("abc", False),
        ("test@.", False),
        ("@.", False),
    ],
)
def test_is_email_valid(email, is_valid):
    """Test `is_email_valid`."""
    assert is_email_valid(email) is is_valid


@pytest.mark.parametrize(
    ("board_in", "board_out"),
    [
        (
            [
                [1, 0, 0, 1, 0],
                [1, 1, 1, 1, 0],
                [0, 0, 2, 2, 2],
                [0, 0, 2, 0, 0],
                [0, 0, 2, 2, 2],
            ],
            [
                [1, 1, 1, 1, 0],
                [1, 1, 1, 1, 0],
                [0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2],
            ],
        ),
        (
            [
                [1, 0, 0, 0, 0],
                [1, 1, 1, 1, 0],
                [0, 0, 2, 2, 0],
                [0, 0, 2, 0, 0],
                [0, 0, 2, 2, 2],
            ],
            [
                [1, 0, 0, 0, 0],
                [1, 1, 1, 1, 0],
                [0, 0, 2, 2, 0],
                [0, 0, 2, 0, 0],
                [0, 0, 2, 2, 2],
            ],
        ),
        (
            [
                [1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2],
            ],
            [
                [1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2],
            ],
        ),
        (
            [
                [1, 1, 1, 1, 1],
                [0, 2, 2, 2, 2],
                [0, 2, 0, 0, 0],
                [0, 2, 2, 0, 0],
                [0, 0, 2, 2, 2],
            ],
            [
                [1, 1, 1, 1, 1],
                [0, 2, 2, 2, 2],
                [0, 2, 2, 2, 2],
                [0, 2, 2, 2, 2],
                [0, 0, 2, 2, 2],
            ],
        ),
        (
            [
                [1, 1, 0, 0, 0],
                [0, 1, 0, 0, 0],
                [1, 1, 0, 2, 2],
                [0, 0, 0, 2, 0],
                [0, 0, 0, 2, 2],
            ],
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 0, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
        ),
    ],
)
def test_fill_paddock(board_in, board_out):
    """Test function `fill_paddock`."""
    assert fill_paddock(board_in) == board_out


@pytest.mark.parametrize(
    ("board", "player", "player_pos", "movement", "is_valid"),
    [
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 0, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            1,
            (2, 1),
            (1, 0),
            True,
        ),
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 0, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            1,
            (2, 1),
            (-1, 0),
            True,
        ),
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 0, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            1,
            (2, 1),
            (0, 1),
            True,
        ),
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 0, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            1,
            (2, 1),
            (0, -1),
            True,
        ),
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 1, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            1,
            (2, 2),
            (1, 0),
            False,
        ),
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 1, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            1,
            (2, 2),
            (-1, 0),
            True,
        ),
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 1, 0, 0],
                [1, 1, 1, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            2,
            (3, 2),
            (-1, 0),
            False,
        ),
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 1, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            2,
            (3, 2),
            (0, -1),
            True,
        ),
    ],
)
def test_is_movement_valid(board, player, player_pos, movement, is_valid):
    """Test `is_email_valid`."""
    assert is_movement_valid(board, player, player_pos, movement) is is_valid


@pytest.mark.parametrize(
    ("email_string", "emails"),
    [
        (
            "test@test.be",
            ["test@test.be"],
        ),
        (
            "hello@test.be;test@test.be",
            ["hello@test.be", "test@test.be"],
        ),
        ("", []),
        ("tedfs", []),
        ("tedfs@", []),
    ],
)
def test_parse_users(email_string, emails):
    """Test `parse_users`."""
    assert parse_users(email_string) == emails


@pytest.mark.parametrize(
    ("board", "board_out"),
    [
        (
            [
                [1, 1, 0, 0, 0],
                [1, 1, 0, 0, 0],
                [1, 1, 1, 2, 2],
                [0, 0, 0, 2, 2],
                [0, 0, 0, 2, 2],
            ],
            "1 1 0 0 0\n1 1 0 0 0\n1 1 1 2 2\n0 0 0 2 2\n0 0 0 2 2",
        )
    ],
)
def test_beautify_board(board, board_out):
    """Test `beautify_board`."""
    assert beautify_board(board) == board_out


@pytest.mark.parametrize(
    ("move", "converted"),
    [
        ("left", (-1, 0)),
        ("l", (-1, 0)),
        ("right", (1, 0)),
        ("r", (1, 0)),
        ("up", (0, -1)),
        ("u", (0, -1)),
        ("down", (0, 1)),
        ("d", (0, 1)),
        ("dfds", None),
        (None, None),
    ],
)
def test_move_converted(move, converted):
    """Test `move_converted`."""
    assert move_converted(move) == converted
