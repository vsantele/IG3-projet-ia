class InvalidPositionException(Exception):
    """Exception raised by an invalid move
    Attributes:
        x (int): x position of the player
        y (int): y position of the player
    """

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return "Position ({},{}) is not valid".format(self.x, self.y)


class InvalidPlayerException(Exception):
    """Exception raised by an invalid player
    Attributes:
        player (int): the invalid player numbers
    """

    def __init__(self, player):
        self.player = player

    def __str__(self):
        return "Player {} is not valid".format(self.player)


class GameFinishedException(Exception):
    """Exception raised by a finished game"""

    def __str__(self):
        return "The game is finished"


class InvalidMoveException(Exception):
    """Exception raised by an invalid move
    Attributes:
        x (int): the x coordinate of the move
        y (int): the y coordinate of the move
    """

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return "Move ({},{}) is not valid.".format(self.x, self.y)


class InvalidActionException(Exception):
    """Exception raised by an invalid action
    Attributes:
        action (str): the invalid action
    """

    def __init__(self, action):
        self.action = action

    def __str__(self):
        return "Action {} is not valid.".format(self.action)
