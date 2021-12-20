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
    yield f"Starting training for {n_games} games..."
    for x in range(0, n_games):
        game = Game()
        db.session.add(game)
        db.session.commit()
        lg.info("Game {} started".format(game.id))
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
        lg.info(game.winner)
        lg.info("Game {} finished in {} turns".format(game.id, nb_turn))
        lg.info(info())
        lg.info("\n" + beautify_board(game.board_array))
        db.session.commit()
        yield f"Game {x+1}/{n_games} finished in {nb_turn} turns. Winner is {game.winner} | {info()}\n"
    set_parameters("play")
    return "Finished"


def start_train_ai(n_games=1000):
    set_parameters("train")
    return train_ai(n_games)


def stop_train_ai():
    pass


def test_ai(n_games=100):
    n_games_won = 0
    for x in range(n_games):
        game = Game()
        db.session.add(game)
        db.session.commit()
        lg.info("Game {}/{} started".format(x + 1, n_games))
        while not game.is_finished:
            try:
                game.move(get_move_random(game, 1), 1)
                game.move(get_move(game), 2)
            except GameFinishedException:
                break
        update_game_finished(game, 2)
        lg.info("\n" + beautify_board(game.board_array))
        yield f"{x+1}\n"
        db.session.commit()
        if game.winner == 2:
            n_games_won += 1
    yield f"{n_games_won}/{n_games} games won ({n_games_won/n_games*100}%)"


def start_test_ai(n_games=100):
    set_parameters("play")
    return test_ai(n_games)
