class BoggleGame {
    /* make a new game at this DOM id */

    constructor(boardId, secs = 60) {
        alert(1)
        this.secs = secs; // game length
        this.showTimer();

        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);

        // every 1000 msec, "tick"
        this.timer = setInterval(this.tick.bind(this), 1000);

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }

    /* show word in list of words */

    showWord(guess) {
        $(".words", this.board).append($("<li>", { text: guess }));
    }

    /* show score in html */

    showScore() {
        $(".score", this.board).text(this.score);
    }

    /* show a status message */

    showMessage(msg, cls) {
        $(".msg", this.board)
            .text(msg)
            .removeClass()
            .addClass(`msg ${cls}`);
    }

    /* handle submission of guess: if unique and valid, score & show */

    async handleSubmit(evt) {
        evt.preventDefault();
        alert(2);
        const $guess = $(".guess", this.board);
        let guess = $guess.val();
        if (!guess) return;

        if (this.words.has(guess)) {
            this.showMessage(`Already found ${guess}`, "err");
            return;
        }

        // check server for validity
        const resp = await axios.post("/check-guess", { params: { guess: guess } });
        if (resp.data.result === "not-word") {
            this.showMessage(`${guess} is not a valid English word`, "err");
        } else if (resp.data.result === "not-on-board") {
            this.showMessage(`${guess} is not a valid word on this board`, "err");
        } else {
            this.showWord(guess);
            this.score += guess.length;
            this.showScore();
            this.words.add(guess);
            this.showMessage(`Added: ${guess}`, "ok");
        }

        $guess.val("").focus();
    }

    /* Update timer in DOM */

    showTimer() {
        $(".timer", this.board).text(this.secs);
    }

    /* Tick: handle a second passing in game */

    async tick() {
        this.secs -= 1;
        this.showTimer();

        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    /* end of game: score and update message. */

    async scoreGame() {
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.brokeRecord) {
            this.showMessage(`New record: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }
}