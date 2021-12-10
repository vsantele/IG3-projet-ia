import os

basedir = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "data/app.db")
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = "DEV-t0_R3Pl4C5"
