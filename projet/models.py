from flask_sqlalchemy import SQLAlchemy
from .views import app
import logging as lg

db = SQLAlchemy(app)

def init_db():
    db.drop_all()
    db.create_all()
    # TODO Add Models
    db.session.commit()
    lg.warning('Databae initialized!')