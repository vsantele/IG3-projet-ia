import logging
import pytest

from flask import template_rendered

from projet import app, db
from projet.models import User, Game


@pytest.fixture
def app():

    _app = app
    _app.logger.setLevel(logging.CRITICAL)
    ctx = _app.test_request_context()
    ctx.push()

    _app.config["TESTING"] = True
    _app.testing = True

    _app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with _app.app_context():
        db.create_all()
        user = User(email="test@test.be", name="test", password="test")
        app.config["USERS_ADMIN"] = [user.email]
        db.session.add(user)
        db.session.commit()

    yield _app
    ctx.pop()


@pytest.fixture
def client():
    client = app.test_client()
    yield client


@pytest.fixture
def captured_templates(app):
    recorded = []

    def record(sender, template, context, **extra):
        recorded.append((template, context))

    template_rendered.connect(record, app)
    try:
        yield recorded
    finally:
        template_rendered.disconnect(record, app)
