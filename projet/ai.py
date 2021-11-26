import random
import numpy as np
from .models import Qtable, History

from .utils import is_movement_valid

"""
For the Qtable
a db with each line the state (Si) and the value associated with each direction
board posPlayer1 posPlayer2 turn (which player is playing) up down left right
.
.
.

"""

movements = {"u": (0, -1), "d": (0, 1), "l": (-1, 0), "r": (1, 0)}


def get_move(game_state):
    """From game_state return the best move"""
    eps = 0.5
    x, y = game_state.pos_player_2

    # 1. recup de l'historique, et mise à jour dans la QTable
    # en fonction du mouvement
    state_history = History.query.get(game_state.id)
    movement_history = state_history.movement
    current_state_qtable_line = Qtable.query.get(state_history.state)

    value = update(
        game_state, state_history, current_state_qtable_line, movement_history
    )

    # 2. choisir le mvt

    if current_state_qtable_line is not None and random.uniform(0, 1) < eps:  # explore
        return random_action(game_state.board_array, game_state.pos_player_2, 2)

    else:  # exploit
        pass

    # 3. mettre à jour le nouvel état ds l'historique


def random_action(board, pos_player, player=2):
    choices = []
    if is_movement_valid(board, player, pos_player, (0, 1)):
        choices.append("d")
    if is_movement_valid(board, player, pos_player, (0, -1)):
        choices.append("u")
    if is_movement_valid(board, player, pos_player, (1, 0)):
        choices.append("r")
    if is_movement_valid(board, player, pos_player, (-1, 0)):
        choices.append("l")
    return random.choice(choices)


def update(game_state, state_history, current_state_qtable_line, movement_history):
    s = state_history
    sp = current_state_qtable_line
    a = movement_history
    alpha = learning_fact()
    gamma = actualisation_fact()
    r = reward()


def learning_fact(self):
    pass


def actualisation_fact(self):
    pass


def reward(self):
    pass
