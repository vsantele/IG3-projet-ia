#!/bin/sh
gunicorn projet:app -b 0.0.0.0:5000 -k gevent --timeout 600