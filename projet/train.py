import logging as lg

from .models import Game, db
from .ai import (
    get_move,
    get_move_random,
    update_discount_factor,
    update_game_finished,
    info,
    set_parameters,
    update_epsilon,
)
from .exceptions import GameFinishedException
from .utils import beautify_board


def train_ai(n_games=1000):
    """Launch a training session for the AI

    Args:
        n_games (int, optional): the number of game to train the AI.
            Defaults to 1000.

    Returns:
        str: Finished string

    Yields:
        string: information about the finised game
    """
    yield f"Starting training for {n_games} games..."
    for x in range(0, n_games):
        game = Game()
        db.session.add(game)
        db.session.commit()
        lg.info("Game {}/{} started".format(x + 1, n_games))
        nb_turn = 0
        while not game.is_finished:
            try:
                game.move(get_move(game), 1)
                nb_turn += 1
                game.move(get_move(game), 2)
                nb_turn += 1
            except GameFinishedException:
                break
        update_game_finished(game, 1)
        update_game_finished(game, 2)
        update_epsilon()
        update_discount_factor()
        lg.info(f"Game {game.id} finished in {nb_turn} turns! Winner: {game.winner}")
        lg.info(info())
        # lg.info("\n" + beautify_board(game.board_array))
        db.session.commit()
        yield f"Game {x+1}/{n_games} finished in {nb_turn} turns. Winner is {game.winner} | {info()}\n"
    set_parameters("play")
    return "Finished"


def start_train_ai(n_games=1000):
    """Start a training session for the AI and set the parameters to train mode

    Args:
        n_games (int, optional): The number of game to train the AI.
            Defaults to 1000.

    Returns:
        Generator: The generator returns by `train_ai`
    """
    set_parameters("train")
    return train_ai(n_games)


def test_ai(n_games=100):
    """Launch a test session for the AI

    Args:
        n_games (int, optional): The number of game to test the AI.
            Defaults to 100.

    Returns:
        str: final stat string

    Yields:
        string: the number of the game just finished
    """
    n_games_won = 0
    for x in range(n_games):
        game = Game()
        db.session.add(game)
        db.session.commit()
        lg.info(f"Game {x + 1}/{n_games} started")
        while not game.is_finished:
            try:
                game.move(get_move_random(game, 1), 1)
                game.move(get_move(game), 2)
            except GameFinishedException:
                break
        update_game_finished(game, 2)
        lg.info(f"Game {x + 1}/{n_games} finished! Winner: {game.winner}")
        # lg.info("\n" + beautify_board(game.board_array))
        yield f"{x+1}\n"
        db.session.commit()
        if game.winner == 2:
            n_games_won += 1
    yield f"{n_games_won}/{n_games} games won ({n_games_won/n_games*100}%)"


def start_test_ai(n_games=100):
    """Start a test session for the AI and set the parameters to test mode

    Args:
        n_games (int, optional): The number of game to test the AI.
            Defaults to 100.

    Returns:
        Generator: The generator returns by `test_ai`
    """
    set_parameters("play")
    return test_ai(n_games)
