FROM python:3.8.12-buster
WORKDIR /app
COPY ./requirements.txt requirements.txt
RUN pip install -r requirements.txt
RUN mkdir data
COPY run.py run.py
COPY config.py config.py
COPY projet/ ./projet/
COPY ./gunicorn_starter.sh gunicorn_starter.sh
CMD ["sh", "gunicorn_starter.sh"]