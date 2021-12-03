# IG3-ProjetIA

Projet IA Henallux Bloc 3 Option Data Science

# Setup

## Setup dotenv file

Create a file `.env` and add all environment variables that are in `sample.env` to it with valid values.

More information about available environment variables can be found below.

## Setup a virtual environment (Optional)

Run `python -m venv venv`

Activate de venv with `venv\Scripts\activate` on Windows and `source venv/bin/activate` on Linux

## Install dependencies

Run `pip install -r requirements.txt`

## Initialize database

Run `flask init_db`

# Run

Run `flask run` or `py run.py`

## User test (only if `FLASK_ENV` = developement)

Email: test@test.be
Password: test

# Config

Some configuration options can be provided via environment variables.
They will override default configuration values.

## Environment Variables:

### `FLASK_ENV`

Either `developement`or `production`.

In production, please use a Production Server such as [`waitress`](https://docs.pylonsproject.org/projects/waitress/en/stable/)

### `FLASK_APP`

Must be `run.py`.

### `SECRET_KEY`

The secret key will be used for securely signing the sessions cookie.

Please, do **NOT** use the default secret key for production environment.

Default= `DEV-t0_R3Pl4C5`

### `SQLALCHEMY_DATABASE_URI`

The URI to connect to the database. Default is a SQLite database store in the basedir of the project

All Dialects available: [Here](https://docs.sqlalchemy.org/en/14/dialects/)

The form of the URI is: `dialect+driver://username:password@host:port/database`

Default = `"sqlite:///" + os.path.join(basedir, "app.db")`

### `SQLALCHEMY_TRACK_MODIFICATIONS`

If you need to track modifications of objects. This requires extra memory.

Default = `False`

### `ADMIN_USERS`

The list separate by `;` of all users's email addresses who are admins.

Example: `"test@test.be;hello@world.com"`
