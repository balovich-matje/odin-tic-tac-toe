(() => {
    const boardEl = document.querySelector(".board");
    const cells = Array.from(document.querySelectorAll(".cell"));
    const statusEl = document.querySelector(".current-player");
    const endBtn = document.querySelector(".end-game");
    const restartBtn = document.querySelector(".restart-game");
    const modeInputs = Array.from(document.querySelectorAll("input[name='mode']"));
    const symbolInputs = Array.from(document.querySelectorAll("input[name='symbol']"));
    const symbolSelection = document.querySelector(".symbol-selection");

    const state = {
        board: Array(9).fill(""),
        current: "X",
        running: false,
        mode: null,
        locked: false,
        playerSymbol: "X",
        computerSymbol: "O",
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

    const setStatus = (message) => {
        statusEl.textContent = message;
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
        for (const [a, b, c] of wins) {
            if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                return state.board[a];
            }
        }
        return null;
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
        setStatus(`Current player: ${state.current}`);
    };

    const placeMark = (index) => {
        state.board[index] = state.current;
        render();
    };

    const handlePostMove = () => {
        const winner = getWinner();
        if (winner) {
            finishGame(`${winner} wins!`);
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
        state.board = Array(9).fill("");
        state.current = "X";
        state.running = true;
        state.locked = false;
        setStatus("Current player: X");
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
        if (clearMode) {
            state.mode = null;
            modeInputs.forEach((input) => {
                input.checked = false;
            });
        }
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
