from flask import Flask, render_template

app = Flask(__name__)
app.config.from_object("config")


@app.route("/")
def index():
    """Root route"""
    return render_template("index.html")
