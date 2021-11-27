import random
import numpy as np
from sqlalchemy.orm.query import Query
from .models import db, Qtable, History

from .utils import is_movement_valid, move_converted, timer, called

"""
For the Qtable
a db with each line the state (Si) and the value associated with each direction
board posPlayer1 posPlayer2 turn (which player is playing) up down left right
.
.
.

"""

movements = {"u": (0, -1), "d": (0, 1), "l": (-1, 0), "r": (1, 0)}


@called
@timer
def get_move(game_state):
    """From game_state return the best move"""
    eps = 0.5
    x, y = pos_player(game_state, game_state.current_player)

    # 1. recup de l'historique, et mise à jour dans la QTable
    # en fonction du mouvement
    new_state = state(game_state)
    q_new_state = q_state(new_state)

    old_state = previous_state(game_state.id, game_state.current_player)
    if old_state is not None:

        # attention, vérifier en cas de création peut-être + quand premier tour
        # current_state_qtable_line
        q_old_state = q_state(old_state.state)

        rew = reward(old_state.state, new_state, game_state.current_player)

        update(old_state.movement, q_old_state, q_new_state, rew)
        db.session.commit()
    # 2. choisir le mvt
    # pourquoi is not None?
    # if q_old_state is not None and random.uniform(0, 1) < eps:  # explore
    if random.uniform(0, 1) < eps:  # explore
        movement = random_action(game_state.board_array, game_state.pos_player_2, 2)

    else:  # exploit
        movement = move_converted(best_move(q_new_state))

    # 3. mettre à jour le nouvel état ds l'historique
    if old_state is None:
        old_state = History(
            game_id=game_state.id,
            current_player=game_state.current_player,
            state=new_state,
            movement=movement,
        )
    else:
        old_state.state = new_state
        old_state.current_player = game_state.current_player
        old_state.movement = movement
    db.session.add(old_state)
    db.session.commit()
    return move_converted(movement)


@called
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


@called
def update(action, q_old_state, q_new_state, reward):
    alpha = learning_rate()
    gamma = discount_factor()

    reward = q_old_state.get_reward(action) + alpha * (
        reward + gamma * r_max(q_new_state) - q_old_state.get_reward(action)
    )
    q_old_state.set_reward(action, reward)


# learning_fact
def learning_rate():

    return 0.1


# actualisation_fact
def discount_factor():
    """determine the discount_factor

    0 = short-sighted
    1 = long-sighted

    Returns:
        float: the discount_factor
    """
    return 0.5


@called
def reward(old_state, new_state, player):
    """calculate the reward based on the evolution of the board

    1 case took by the player = +1 point.
    1 case took by the other player = -0.1 point

    Args:
        old_state (str): the old state
        new_state (str): the new state
        player (int): the player number who learns

    Returns:
        reward: the reward of the previous action
    """
    old_board, _, _, _ = state_parsed(old_state)
    new_board, _, _, _ = state_parsed(new_state)

    reward = 0

    old_nb_case_player = old_board.count(str(player))
    new_nb_case_player = new_board.count(str(player))
    old_nb_case_other = old_board.count(str(other_player(player)))
    new_nb_case_other = new_board.count(str(other_player(player)))

    reward += new_nb_case_player - old_nb_case_player
    reward -= (new_nb_case_other - old_nb_case_other) * 0.1
    return reward


@called
def previous_state(game_id, current_player):
    """Get previous state from the database

    Args:
        game_id (int): id of the game
        current_player (int): the player number who learns

    Returns:
        state: the state of the game
        movement: the movement of the player
    """
    previous = History.query.get((game_id, current_player))
    return previous


@called
def state_parsed(state):
    """retreive state information from the string

    Args:
        state (string): state concat in string

    Returns:
        str: board: the board in string
        int: pos_player_1: the position of player 1
        int: pos_player_2: the position of player 2
        int: turn: the player who has to play.
    """
    board = state[:25]
    p1_x = int(state[25])
    p1_y = int(state[26])
    p2_x = int(state[27])
    p2_y = int(state[28])
    pos_player1 = p1_x, p1_y
    pos_player2 = p2_x, p2_y
    turn = int(state[29])
    return board, pos_player1, pos_player2, turn


def other_player(player):
    """get the other player number

    Args:
        player (int): the current player

    Returns:
        int: the other player number
    """
    if player == 1:
        return 2
    else:
        return 1


def pos_player(game_state, player):
    """return the position of a player

    Args:
        game_state (GameState): the current state of the game
        player (int): the player number
    Returns:
        (int, int): the position of the player
    """
    if player == 1:
        return game_state.pos_player_1
    return game_state.pos_player_2


def state(game_state):
    """convert game state to string state

    Args:
        game_state (Game): the game object from db

    Returns:
        str: the converted string state
    """
    board = game_state.board
    pos_player_1 = game_state.pos_player_1
    pos_player_2 = game_state.pos_player_2
    turn = game_state.current_player
    return (
        board
        + str(pos_player_1[0])
        + str(pos_player_1[1])
        + str(pos_player_2[0])
        + str(pos_player_2[1])
        + str(turn)
    )


@called
def q_state(state):
    """Retreive the qtable line for the state if it exists.
    Otherwise create it and return it.

    Args:
        state (str): the state

    Returns:
        Qtable: the line of the qtable
    """
    q = Qtable.query.get(state)
    if q is None:
        q = Qtable(state=state)
        db.session.add(q)
        db.session.commit()
    return q


def best_move(q_line):
    """return the movement with the highest reward

    Args:
        q_line (Qtable): a line of the qtable

    Returns:
        str: the best movement
    """
    best_r = q_line["u"]
    best_m = "u"
    if q_line["r"] > best_r:
        best_r = q_line["r"]
        best_m = "r"
    if q_line["d"] > best_r:
        best_r = q_line["d"]
        best_m = "d"
    if q_line["l"] > best_r:
        best_r = q_line["l"]
        best_m = "l"
    return best_m
