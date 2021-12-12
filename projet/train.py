import logging as lg

from .models import Game, db
from .ai import (
    get_move,
    update_discount_factor,
    update_game_finished,
    info,
    set_parameters,
    update_epsilon,
    update_learning_rate,
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
                game.move(get_move(game), 2)
                nb_turn += 2
            except GameFinishedException:
                break
        update_game_finished(game, 1)
        update_game_finished(game, 2)
        update_epsilon()
        update_learning_rate()
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
