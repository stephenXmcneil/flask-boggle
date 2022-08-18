from flask import Flask, render_template, request, session, jsonify, redirect
from boggle import Boggle

app = Flask(__name__)
boggle_game = Boggle()
app.config['SECRET_KEY'] = "game"

@app.route("/")
def start_page():
    session.clear()
    """generating a board from dictionary"""

    boggle_game.read_dict("words.txt")
    char_list = boggle_game.make_board()

    #save current game in a session
    session['current_board'] = char_list

    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    return render_template("createBoard.html", char_list=char_list, highscore=highscore, nplays=nplays)

@app.route("/check-guess", methods=["POST"])
def isGuessValid():
    guess = request.json
    print("JSON check word")
    guess_word = guess['params']['guess']
    print(guess_word)
    board = session["current_board"]
    response = boggle_game.check_valid_word(board, guess_word)
    return jsonify({'result': response})
    

@app.route("/score", methods=["POST"])
def post_score():
    """Receive score, update nplays, update high score if appropriate."""

    score = request.json["score"]
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)
    boggle_game.scoreGame()
    session['nplays'] = nplays + 1
    session['highscore'] = max(score, highscore)
   
    return jsonify(brokeRecord=score > highscore)