import random
from .models import db, Qtable, History, Game
import logging as lg
from typing import List, Tuple

from .utils import move_converted, timer, all_valid_movements, state_parsed, state_str


MIN_EPSILON = 0.01
MAX_EPSILON = 0.99

MIN_DISCOUNT_FACTOR = 0.1
MAX_DISCOUNT_FACTOR = 0.7

epsilon = 0.01
learning_rate = 0.1
discount_factor = 0.9


@timer
def get_move(game_state: Game) -> Tuple[int, int]:
    """From a given game_state return the best move

    How epsilon-greedy works:
        Epsilon is the probability to choose a random action.
        If the random number is lower than epsilon, the random action is chosen.
        If the random number is higher than epsilon, the best action is chosen.

        In training mode, the epsilon is updated.
        It starts at 0.99 and decreases to 0.01 at the end of each game
        via the `update_epsilon` function. it's optimize for batch of 100 000 games.

        In playing mode, the epsilon is set to 0.01. and doesn't change.

    Args:
        game_state (Game): the game state

    Returns:
        Tuple[int,int]: the selected movement
    """
    x, y = pos_player(game_state, game_state.current_player)

    # 1. find the history and update in the QTable in regards of the movement
    new_state = state_str(game_state)
    q_new_state = q_state(new_state)

    old_state = previous_state(game_state.id, game_state.current_player)
    if old_state is not None:
        q_old_state = q_state(old_state.state)

        rew = reward(old_state.state, new_state, game_state.current_player)

        update_quality(old_state.movement, q_old_state, q_new_state, rew)

    # 2. choose the step between explore or exploit
    # explore step
    if random.uniform(0, 1) < epsilon:
        movement = random_action(
            game_state.board_array, (x, y), game_state.current_player
        )
    # exploit step
    else:
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
    It's the same mechanism than the update in game
    but force the last state to be be updated.

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

        update_quality(old_state.movement, q_old_state, q_new_state, rew)


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


def update_quality(
    action: str, q_old_state: Qtable, q_new_state: Qtable, reward_value: float
):
    """Update the previous Q[s,a] with the reward and the new Q[s,a]

    Args:
        action (str): the direction in 1 letter ('u', 'd', 'l' or 'r')
        q_old_state (Qtable): The previous Q[s,a]
        q_new_state (Qtable): The new Q[s,a]
        reward (float): the reward from the previous action
    """
    alpha = learning_rate
    gamma = discount_factor

    quality = q_old_state.get_quality(action) + alpha * (
        reward_value + gamma * q_new_state.max() - q_old_state.get_quality(action)
    )
    q_old_state.set_quality(action, quality)


def update_epsilon():
    """Update the global epsilon variable

    With this formula, the epsilon is high for about 80 000 games
    then drop to 0.1 for the next 20 000 games.
    """
    global epsilon
    if epsilon > 0.01 and random.uniform(0, 1) < 10 * (1 - epsilon) ** 2:
        epsilon = epsilon * 0.9999


def update_discount_factor():
    """Update the discount_factor from global variable

    Discount factor:
        - 0 = short-sighted
        - 1 = long-sighted

    With this formula, the dicsount factor needs about 25 000 games
    to reach his max value.

    """
    global discount_factor
    if discount_factor < MAX_DISCOUNT_FACTOR:
        discount_factor *= 1.0001


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
    return 2 if player == 1 else 1


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
    """Return the current state of the learning"""
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


def set_parameters(mode: str):
    """Set the value of the pamaeters according to the mode

    Args:
        mode (str): the mode of the app (train or play)
    """
    global epsilon, learning_rate, discount_factor
    if mode == "train":
        epsilon = MAX_EPSILON
        learning_rate = 0.1
        discount_factor = MIN_DISCOUNT_FACTOR
    else:
        epsilon = MIN_EPSILON
        learning_rate = 0.1
        discount_factor = MAX_DISCOUNT_FACTOR


def get_move_random(game_state: Game, player: int) -> Tuple[int, int]:
    """Return a random movement

    Args:
        game_state (Game): the current state of the game
        player (int): the player number

    Returns:
        Tuple[int, int]: a random movement
    """
    return move_converted(
        random_action(game_state.board_array, pos_player(game_state, player), player)
    )
