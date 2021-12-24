FROM python:3.8.12-buster
WORKDIR /app
RUN pip install --no-cache-dir mariadb
COPY ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir data
COPY ./gunicorn_starter.sh gunicorn_starter.sh
COPY run.py run.py
COPY config.py config.py
COPY projet/ ./projet/
CMD ["sh", "gunicorn_starter.sh"]