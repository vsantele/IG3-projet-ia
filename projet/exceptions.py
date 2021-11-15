class Error(Exception):
    """Base class for exception"""

    pass


class InvalidPositionException(Exception):
    """Exception raised by an invalid move
    Attirbutes :
        message (str): the message that we should push to the view to inform the user
    """

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return "Position ({},{}) is not valid".format(self.x, self.y)


class InvalidPlayerException(Exception):
    """Exception raised by an invalid player
    Attirbutes :
        message (str): the message that we should push to the view to inform the user
    """

    def __init__(self, player):
        self.player = player

    def __str__(self):
        return "Player {} is not valid".format(self.player)


class GameFinishedException(Exception):
    """Exception raised by a finished game
    Attirbutes :
        message (str): the message that we should push to the view to inform the user
    """

    def __str__(self):
        return "The game is finished"


class InvalidMoveException(Exception):
    """Exception raised by an invalid move
    Attirbutes :
        message (str): the message that we should push to the view to inform the user
    """

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return "Move ({},{}) is not valid.".format(self.x, self.y)
