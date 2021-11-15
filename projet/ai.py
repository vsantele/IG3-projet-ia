import random

"""
For the Qtable
a db with each line the state (Si) and the value associated with each direction
board posPlayer1 posPlayer2 turn (which player is playing) up down left right
.
.
.

"""


def get_move(game_state):
    """From game_state return the best move"""
    x, y = game_state.pos_player_2
    choices = []
    if x > 0:
        choices.append((-1, 0))
    if x < 4:
        choices.append((1, 0))
    if y > 0:
        choices.append((0, -1))
    if y < 4:
        choices.append((0, 1))
    return random.choice(choices)
