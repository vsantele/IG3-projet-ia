import random


def get_move(game_state):
    """From game_state return the best move"""
    x = game_state.pos_player2_X
    y = game_state.pos_player2_Y
    choices = []
    if x > 0:
        choices.append("left")
    if x < 4:
        choices.append("right")
    if y > 0:
        choices.append("up")
    if y < 4:
        choices.append("down")
    return random.choice(choices)
