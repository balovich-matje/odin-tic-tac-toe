(() => {
    const boardEl = document.querySelector(".board");
    const cells = Array.from(document.querySelectorAll(".cell"));
    const statusEl = document.querySelector(".current-player");
    const endBtn = document.querySelector(".end-game");
    const restartBtn = document.querySelector(".restart-game");
    const modeInputs = Array.from(document.querySelectorAll("input[name='mode']"));
    const symbolInputs = Array.from(document.querySelectorAll("input[name='symbol']"));
    const symbolSelection = document.querySelector(".symbol-selection");
    const playerOneInput = document.querySelector("#player-one");
    const playerTwoInput = document.querySelector("#player-two");
    const playerTwoRow = document.querySelector(".player-two-row");
    const winLineEl = document.createElement("div");
    winLineEl.className = "win-line";
    boardEl.appendChild(winLineEl);

    const state = {
        board: Array(9).fill(""),
        current: "X",
        running: false,
        mode: null,
        locked: false,
        playerSymbol: "X",
        computerSymbol: "O",
        playerOneName: "Player 1",
        playerTwoName: "Player 2",
    };

    const wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const winLinePositions = [
        { x: "50%", y: "16.7%", rotate: "0deg", length: "90%" },
        { x: "50%", y: "50%", rotate: "0deg", length: "90%" },
        { x: "50%", y: "83.3%", rotate: "0deg", length: "90%" },
        { x: "16.7%", y: "50%", rotate: "90deg", length: "90%" },
        { x: "50%", y: "50%", rotate: "90deg", length: "90%" },
        { x: "83.3%", y: "50%", rotate: "90deg", length: "90%" },
        { x: "50%", y: "50%", rotate: "45deg", length: "120%" },
        { x: "50%", y: "50%", rotate: "-45deg", length: "120%" },
    ];

    const setStatus = (message) => {
        statusEl.textContent = message;
    };

    const getPlayerName = (symbol) => {
        if (state.mode === "pvp") {
            return symbol === "X" ? state.playerOneName : state.playerTwoName;
        }
        return symbol === state.playerSymbol ? state.playerOneName : "Computer";
    };

    const updateNames = () => {
        const one = playerOneInput.value.trim();
        const two = playerTwoInput.value.trim();
        state.playerOneName = one || "Player 1";
        state.playerTwoName = two || "Player 2";
    };

    const render = () => {
        cells.forEach((cell, index) => {
            cell.textContent = state.board[index];
            const disabled = !state.running || state.board[index] !== "" || state.locked;
            cell.classList.toggle("is-disabled", disabled);
        });
    };

    const updateSymbols = (value) => {
        state.playerSymbol = value;
        state.computerSymbol = value === "X" ? "O" : "X";
    };

    const getWinner = () => {
        for (let i = 0; i < wins.length; i += 1) {
            const [a, b, c] = wins[i];
            if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                return { symbol: state.board[a], comboIndex: i };
            }
        }
        return null;
    };

    const clearWinLine = () => {
        winLineEl.classList.remove("is-visible");
        winLineEl.style.removeProperty("--line-x");
        winLineEl.style.removeProperty("--line-y");
        winLineEl.style.removeProperty("--line-rotate");
        winLineEl.style.removeProperty("--line-length");
    };

    const showWinLine = (comboIndex) => {
        const config = winLinePositions[comboIndex];
        if (!config) {
            return;
        }
        winLineEl.style.setProperty("--line-x", config.x);
        winLineEl.style.setProperty("--line-y", config.y);
        winLineEl.style.setProperty("--line-rotate", config.rotate);
        winLineEl.style.setProperty("--line-length", config.length);
        winLineEl.classList.add("is-visible");
    };

    const getEmptyIndices = () =>
        state.board
            .map((value, index) => (value === "" ? index : null))
            .filter((value) => value !== null);

    const finishGame = (message) => {
        state.running = false;
        state.locked = false;
        setStatus(message);
        render();
    };

    const switchPlayer = () => {
        state.current = state.current === "X" ? "O" : "X";
        setStatus(`Current player: ${getPlayerName(state.current)} (${state.current})`);
    };

    const placeMark = (index) => {
        state.board[index] = state.current;
        render();
    };

    const handlePostMove = () => {
        const winner = getWinner();
        if (winner) {
            showWinLine(winner.comboIndex);
            finishGame(`${getPlayerName(winner.symbol)} wins!`);
            return;
        }
        if (getEmptyIndices().length === 0) {
            finishGame("It's a draw!");
            return;
        }
        switchPlayer();
        if (state.mode === "pve" && state.current === state.computerSymbol) {
            queueComputerMove();
        }
    };

    const queueComputerMove = () => {
        state.locked = true;
        setStatus("Computer is thinking...");
        render();
        window.setTimeout(() => {
            const empty = getEmptyIndices();
            if (empty.length === 0 || !state.running) {
                state.locked = false;
                render();
                return;
            }
            const choice = empty[Math.floor(Math.random() * empty.length)];
            state.locked = false;
            state.current = state.computerSymbol;
            placeMark(choice);
            handlePostMove();
        }, 350);
    };

    const startGame = (mode) => {
        state.mode = mode;
        updateNames();
        state.board = Array(9).fill("");
        state.current = "X";
        state.running = true;
        state.locked = false;
        clearWinLine();
        setStatus(`Current player: ${getPlayerName("X")} (X)`);
        render();
        if (state.mode === "pve" && state.current === state.computerSymbol) {
            queueComputerMove();
        }
    };

    const resetGame = ({ clearMode }) => {
        state.board = Array(9).fill("");
        state.current = "X";
        state.running = false;
        state.locked = false;
        clearWinLine();
        if (clearMode) {
            state.mode = null;
            modeInputs.forEach((input) => {
                input.checked = false;
            });
        }
        playerTwoRow.classList.toggle("is-hidden", state.mode !== "pvp");
        symbolSelection.classList.toggle("is-hidden", state.mode !== "pve");
        setStatus(clearMode ? "Select a game mode to start." : "Select a game mode or restart.");
        render();
    };

    const onCellClick = (event) => {
        if (!state.running || state.locked) {
            return;
        }
        if (state.mode === "pve" && state.current === state.computerSymbol) {
            return;
        }
        const cell = event.target.closest(".cell");
        if (!cell) {
            return;
        }
        const index = Number(cell.dataset.index);
        if (Number.isNaN(index) || state.board[index] !== "") {
            return;
        }
        placeMark(index);
        handlePostMove();
    };

    boardEl.addEventListener("click", onCellClick);
    modeInputs.forEach((input) => {
        input.addEventListener("change", (event) => {
            const mode = event.target.value;
            playerTwoRow.classList.toggle("is-hidden", mode !== "pvp");
            symbolSelection.classList.toggle("is-hidden", mode !== "pve");
            startGame(mode);
        });
    });

    symbolInputs.forEach((input) => {
        input.addEventListener("change", (event) => {
            updateSymbols(event.target.value);
            if (state.mode === "pve") {
                startGame("pve");
            }
        });
    });

    [playerOneInput, playerTwoInput].forEach((input) => {
        input.addEventListener("input", () => {
            updateNames();
            if (state.running) {
                setStatus(`Current player: ${getPlayerName(state.current)} (${state.current})`);
            }
        });
    });

    restartBtn.addEventListener("click", () => {
        if (state.mode) {
            startGame(state.mode);
        } else {
            resetGame({ clearMode: false });
        }
    });

    endBtn.addEventListener("click", () => {
        resetGame({ clearMode: true });
    });

    updateSymbols("X");
    resetGame({ clearMode: true });
})();
