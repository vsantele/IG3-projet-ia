import random
from .models import db, Qtable, History, Game
import logging as lg
from typing import List, Tuple

from .utils import move_converted, timer, all_valid_movements, state_parsed, state_str

"""
For the Qtable
a db with each line the state (Si) and the value associated with each direction
board posPlayer1 posPlayer2 turn (which player is playing) up down left right
.
.
.

"""

epsilon = 0.95
learning_rate = 0.99
discount_factor = 0.1


@timer
def get_move(game_state: Game) -> Tuple[int, int]:
    """From game_state return the best move

    How epsilon-greedy works:
        To chose the movement, we need to consider that the Ai will learn during the game
        but continue to take some random choices.

        To illustrate that, at the start, we establish that
        the ai will choose in 90% of the case a random action.

        It's the explore step.
        During this step, we change the epsilon only in a % that depend on
        the epsilon and to provide a little random choice to
        the Ai we don't down the epsilon under 0.01

        More ai explore, more ai learn, and more she decide to use the exploit step.

        In this case, ai will choose to explore during +/- 100 000 first iterations,
        then ai switch into the exploit step.

    Args:
        game_state (Game): the game state

    Returns:
        tuple[int,int]: the selected movement

    """
    global epsilon
    global learning_rate
    global discount_factor
    x, y = pos_player(game_state, game_state.current_player)

    # 1. find the history and update in the QTable in regards of the movement
    new_state = state_str(game_state)
    q_new_state = q_state(new_state)

    old_state = previous_state(game_state.id, game_state.current_player)
    if old_state is not None:
        q_old_state = q_state(old_state.state)

        rew = reward(old_state.state, new_state, game_state.current_player)

        update(old_state.movement, q_old_state, q_new_state, rew)

    # explore step
    if random.uniform(0, 1) < epsilon:
        # lg.debug("Explore")
        movement = random_action(
            game_state.board_array, (x, y), game_state.current_player
        )
        # very slowly down of the epsilon
        update_epsilon()
    # exploit step
    else:
        # lg.debug("Exploit")
        valid_movements = all_valid_movements(
            game_state.board_array, game_state.current_player, (x, y)
        )
        try:
            movement = q_new_state.best(valid_movements)
        except IndexError:
            # if there is no valid movement, we choose a random one
            # It's a security to always return a movement
            lg.error("No valid movements")
            movement = random_action(
                game_state.board_array, (x, y), game_state.current_player
            )
    # return move_converted(movement)
    # movement = q_new_state.best(valid_movements)

    # 3. update in the history table the new state
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


def update_game_finished(game_state, player):
    """Update the QTable when the game is finished

    Args:
        game_state (Game): the game state
    """

    new_state = state_str(game_state)
    old_state = previous_state(game_state.id, player)

    q_new_state = q_state(new_state)

    if old_state is not None:
        q_old_state = q_state(old_state.state)
        rew = reward(
            old_state.state,
            new_state,
            game_state.current_player,
            winner=game_state.winner,
        )

        update(old_state.movement, q_old_state, q_new_state, rew)


def random_action(
    board: List[List[int]], pos_cur_player: Tuple[int, int], player: int = 2
) -> str:
    """Choose a valid random action.

    Args:
        board (list[list[int]]): the board
        pos_player (tuple[int, int]): the player position
        player (int, optional): the player number. Defaults to 2.

    Returns:
        str: a direction between ['u', 'd', 'l', 'r']
    """
    return random.choice(all_valid_movements(board, player, pos_cur_player))


def update(action: str, q_old_state: Qtable, q_new_state: Qtable, reward_value: float):
    """Update the previous Q[s,a] with the reward and the new Q[s,a]

    Args:
        action (str): the direction in 1 letter ('u', 'd', 'l' or 'r')
        q_old_state (Qtable): The previous Q[s,a]
        q_new_state (Qtable): The new Q[s,a]
        reward (float): the reward from the previous action
    """
    alpha = updated_learning_rate()
    gamma = updated_discount_factor()

    quality = q_old_state.get_quality(action) + alpha * (
        reward_value + gamma * q_new_state.max() - q_old_state.get_quality(action)
    )
    q_old_state.set_quality(action, quality)


def update_epsilon():
    """Update the global epsilon variable"""
    global epsilon
    if epsilon > 0.01 and random.uniform(0, 1) < (1 - epsilon) ** 2:
        epsilon = epsilon * 0.9999


def updated_learning_rate():
    """Return the learning_rate from global variable

    Returns:
        float: the updated learning_rate
    """
    global learning_rate
    if learning_rate > 0.1:
        learning_rate = learning_rate * 0.9999
    return learning_rate


def updated_discount_factor():
    """Return the discount_factor from global variable

    0 = short-sighted
    1 = long-sighted

    Returns:
        float: the updated discount_factor
    """
    global discount_factor
    if discount_factor < 0.99:
        discount_factor *= 1.0001
    return discount_factor


def reward(old_state: str, new_state: str, player: int, winner: int = 0) -> float:
    """Calculate the reward based on the evolution of the board

    How it works:
        - 1 case took by the player = +1 point.
        - 1 case took by the other player = -0.5 point
        - if win = +10 points

    Args:
        old_state (str): the old state
        new_state (str): the new state
        player (int): the player number who learns (1 or 2)

    Returns:
        reward: the reward of the previous action
    """
    old_board, *_ = state_parsed(old_state)
    new_board, *_ = state_parsed(new_state)

    points = 0

    old_nb_case_player = old_board.count(str(player))
    new_nb_case_player = new_board.count(str(player))
    old_nb_case_other = old_board.count(str(other_player(player)))
    new_nb_case_other = new_board.count(str(other_player(player)))

    if winner == player:
        points += 10
    points += new_nb_case_player - old_nb_case_player
    points -= (new_nb_case_other - old_nb_case_other) * 0.5
    return points


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





def other_player(player: int) -> int:
    """Get the other player number

    Args:
        player (int): the current player (1 or 2)

    Returns:
        int: the other player number
    """
    if player == 1:
        return 2
    return 1


def pos_player(game_state: Game, player: int) -> Tuple[int, int]:
    """Return the position of a player

    Args:
        game_state (GameState): the current state of the game
        player (int): the player number
    Returns:
        (int, int): the position of the player
    """
    if player == 1:
        return game_state.pos_player_1
    return game_state.pos_player_2




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




def info():
    return (
        "Eps: "
        + str(epsilon)
        + " | "
        + "LR: "
        + str(learning_rate)
        + " | "
        + "DF: "
        + str(discount_factor)
    )
