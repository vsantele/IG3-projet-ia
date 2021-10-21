import pytest
from projet.utils import is_email_valid, update_board


@pytest.mark.parametrize("email", ["test@example.com", "vic@test.wtf"])
def test_is_email_valid_true(email):
    assert is_email_valid(email)


@pytest.mark.parametrize(
    "email", ["@example.com", "@test", "test@", "test@test.", "", "abc", "test@.", "@."]
)
def test_is_email_valid_false(email):
    assert is_email_valid(email) is False


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
    ],
)
def test_update_board(board_in, board_out):
    assert update_board(board_in) == board_out
