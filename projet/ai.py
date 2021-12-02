import random
import numpy as np
from sqlalchemy.orm.query import Query
from .models import db, Qtable, History, Ai, Game
import logging as lg
from typing import List, Tuple

from .utils import is_movement_valid, move_converted, timer, called

"""
For the Qtable
a db with each line the state (Si) and the value associated with each direction
board posPlayer1 posPlayer2 turn (which player is playing) up down left right
.
.
.

"""


def get_ai() -> Ai:
    """Get the ai object

    Returns:
        Ai: the ai object
    """
    ai = Ai.query.get(1)
    return ai


def get_move(game_state: Game):
    """From game_state return the best move

    How epsilon-greedy works:
        To chose the movement, we need to consider that the Ai will learn during the game
        but continue to take some random choices.

        To illustrate that, at the start, we establish that the ai will choose in 90% of the case
        a random action.

        It's the explore step.
        During this step, we change the epsilon only in a % that depend on the epsilon and to provide
        a little random choice to the Ai we don't down the epsilon under 0.01

        More ai explore, more ai learn, and more she decide to use the exploit step.

        In this case, ai will choose to explore during +/- 100 000 first iterations,
        then ai switch into the exploit step.

    Args:
        game_state (Game): the game state

    Returns:
        tuple[int,int]: the movement

    """
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

    if random.uniform(0, 1) < eps():  # explore
        lg.debug("Explore")
        movement = random_action(
            game_state.board_array, (x, y), game_state.current_player
        )
        # diminution très lente du espilon
        if eps() > 0.001 and random.uniform(0, 1) < (1 - eps()) ** 2:
            get_ai().epsilon = eps() * 0.9999

    else:  # exploit
        lg.debug("Exploit")
        valid_movements = all_valid_movements(
            game_state.board_array, game_state.current_player, (x, y)
        )
        movement = q_new_state.best(valid_movements)

    # 3. mettre à jour le nouvel état ds l'historique
    if old_state is None:
        old_state = History(
            game_id=game_state.id,
            current_player=game_state.current_player,
            state=new_state,
            movement=movement,
        )
        db.session.add(old_state)
    else:
        old_state.state = new_state
        old_state.current_player = game_state.current_player
        old_state.movement = movement
    db.session.commit()
    return move_converted(movement)


def random_action(
    board: List[List[int]], pos_player: Tuple[int, int], player: int = 2
) -> str:
    """Choose a valid random action.

    Args:
        board (list[list[int]]): the board
        pos_player (tuple[int, int]): the player position
        player (int, optional): the player number. Defaults to 2.

    Returns:
        str: a direction between ['u', 'd', 'l', 'r']
    """
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


def update(action: str, q_old_state: Qtable, q_new_state: Qtable, reward: float):
    """Update the previous Q[s,a] with the reward and the new Q[s,a]

    Args:
        action (str): the direction in 1 letter ('u', 'd', 'l' or 'r')
        q_old_state (Qtable): The previous Q[s,a]
        q_new_state (Qtable): The new Q[s,a]
        reward (float): the reward from the previous action
    """
    alpha = learning_rate()
    gamma = discount_factor()

    reward = q_old_state.get_reward(action) + alpha * (
        reward + gamma * q_new_state.max() - q_old_state.get_reward(action)
    )
    q_old_state.set_reward(action, reward)


def eps():
    """return the espilon from ai object

    Returns:
        float: the current espilon
    """
    return get_ai().epsilon


def learning_rate():
    """return the learning_fact from ai object

    Returns:
        float: the current learning_rate
    """
    return get_ai().learning_rate


def discount_factor():
    """Determine the discount_factor

    0 = short-sighted
    1 = long-sighted

    Returns:
        float: the discount_factor
    """
    return get_ai().discount_factor


def reward(old_state: str, new_state: str, player: int):
    """Calculate the reward based on the evolution of the board

    How it works:

    1 case took by the player = +1 point.
    1 case took by the other player = -0.5 point

    Args:
        old_state (str): the old state
        new_state (str): the new state
        player (int): the player number who learns (1 or 2)

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
    reward -= (new_nb_case_other - old_nb_case_other) * 0.5
    return reward


def previous_state(game_id: int, current_player: int):
    """Get previous state from the database

    Args:
        game_id (int): id of the game
        current_player (int): the player number who learns

    Returns:
        state: The old state from History table
    """
    previous = History.query.get((game_id, current_player))
    return previous


def state_parsed(state: str):
    """Retreive state information from the string

    Args:
        state (string): state concat in string

    Returns:
        str: board: the board in string
        int: pos_player_1: the position of player 1 in a tuple
        int: pos_player_2: the position of player 2 in a tuple
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


def other_player(player: int):
    """get the other player number

    Args:
        player (int): the current player (1 or 2)

    Returns:
        int: the other player number
    """
    if player == 1:
        return 2
    else:
        return 1


def pos_player(game_state: Game, player: int) -> Tuple[int, int]:
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


def state(game_state: Game) -> str:
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


def q_state(state: str) -> Qtable:
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


def all_valid_movements(
    board: List[List[int]], player: int, pos: Tuple[int, int]
) -> List[str]:
    """Return all valid movements for a player

    Args:
        board (List[List[int]]): the board
        player (int): the player number
        pos (tuple(int,int)): the position of the player

    Returns:
        List[str]: All valid movements
    """

    movements = []
    if is_movement_valid(board, player, pos, (0, 1)):
        movements += ["d"]
    if is_movement_valid(board, player, pos, (0, -1)):
        movements += ["u"]
    if is_movement_valid(board, player, pos, (1, 0)):
        movements += ["r"]
    if is_movement_valid(board, player, pos, (-1, 0)):
        movements += ["l"]
    return movements
