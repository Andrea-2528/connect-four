const ROWS = 6;
const COLUMNS = 7;

function Gameboard() {
    const board = [];

    for (let i = 0; i < ROWS; i++) {
        board[i] = [];
        for (let j = 0; j < COLUMNS; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const dropToken = (column, player) => {
        const availableCells = board.filter((row) => row[column].getValue() === 0).map(row => row[column]);

        if (!availableCells.length) return;

        const lowestRow = availableCells.length - 1;
        board[lowestRow][column].addToken(player);
    };

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues);
    };

    return { getBoard, dropToken, printBoard };
}

function Cell() {
    let value = 0;

    const addToken = (player) => {
        value = player;
    };

    const getValue = () => value;

    return {
        addToken,
        getValue
    };
}

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    let turnsCounter = 0;

    const players = [
        {
            name: playerOneName,
            token: 1
        },
        {
            name: playerTwoName,
            token: 2
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const printWinner = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name} wins!`);
    }

    const playRound = (column) => {
        console.log(
            `Dropping ${getActivePlayer().name}'s token into column ${column}...`
        );
        board.dropToken(column, getActivePlayer().token);

        if(CheckWin(board.getBoard())===true) {
            printWinner();
            return;
        }

        turnsCounter++;
        console.log(`${turnsCounter} turns played.`);

        if (turnsCounter === ROWS*COLUMNS) {
            console.log("It's a draw!");
            return;
        }

        switchPlayerTurn();
        printNewRound();
    };

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    };
}

function CheckWin(board) {
    const checkLine = (a, b, c, d) => {
        // Check first cell non-zero and all cells match
        return ((a != 0) && (a == b) && (a == c) && (a == d));
    };

    // Check down
    for (let r = 0; r < 3; r++){
        for (let c = 0; c < 7; c++){
            if (checkLine(board[r][c].getValue(), board[r+1][c].getValue(), board[r+2][c].getValue(), board[r+3][c].getValue())) {
                return true;
            }
        }
    }

    // Check right
    for (let r = 0; r < 6; r++){
        for (let c = 0; c < 4; c++){
            if (checkLine(board[r][c].getValue(), board[r][c+1].getValue(), board[r][c+2].getValue(), board[r][c+3].getValue())) {
                return true;
            }
        }
    }

    // Check down-right
    for (let r = 0; r < 3; r++){
        for (let c = 0; c < 4; c++){
            if (checkLine(board[r][c].getValue(), board[r+1][c+1].getValue(), board[r+2][c+2].getValue(), board[r+3][c+3].getValue())) {
                return true;
            }
        }
    }

    // Check down-left
    for (let r = 0; r < 3; r++){
        for (let c = 3; c < 7; c++){
            if (checkLine(board[r][c].getValue(), board[r+1][c-1].getValue(), board[r+2][c-2].getValue(), board[r+3][c-3].getValue())) {
                return true;
            }
        }
    }

    return 0;

}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const winMessageDiv = document.querySelector('.message');
    const boardDiv = document.querySelector('.board');
    
    let turnsCounter = 0;

    const updateScreen = () => {
        // clear the board
        boardDiv.textContent = "";

        // get the newest version of the board and player turn
        const board = game.getBoard();

        // Display player's turn
        playerTurnDiv.textContent = `${game.getActivePlayer().name}'s turn...`

        // Render board squares
        board.forEach(row => {
            row.forEach((cell, index) => {
                // Anything clickable should be a button!!
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                // Create a data attribute to identify the column
                // This makes it easier to pass into our `playRound` function 
                cellButton.dataset.column = index
                // cellButton.textContent = cell.getValue();
                switch(cell.getValue()) {
                    case 0:
                         cellButton.innerHTML = '<span class="empty"></span>'
                        break;
                    case 1:
                        cellButton.innerHTML = '<span class="red-circle"></span>';
                        break;
                    case 2:
                        cellButton.innerHTML = '<span class="blue-circle"></span>'
                        break;
                }

                boardDiv.appendChild(cellButton);
            })
        })
    }

    // Add event listener for the board
    function clickHandlerBoard(e) {
        const selectedColumn = e.target.dataset.column;
        // Make sure I've clicked a column and not the gaps in between, and that the game isn't over
        if (!selectedColumn || CheckWin(game.getBoard())|| turnsCounter===ROWS*COLUMNS) return;
        
        game.playRound(selectedColumn);
        turnsCounter++;
        
        if (CheckWin(game.getBoard())) {
            winMessageDiv.textContent = `${game.getActivePlayer().name} wins!`;
        }

        if (turnsCounter===ROWS*COLUMNS) {
            winMessageDiv.textContent = "It's a draw!";
        }
        
        updateScreen();
    }

    boardDiv.addEventListener("click", clickHandlerBoard);

    // Initial render
    updateScreen();

    // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
}

ScreenController();