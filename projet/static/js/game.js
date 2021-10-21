/*global board, boardString, players, gameID */

let canSendMovement = true;

async function caseTrigger(movement) {
  if (canSendMovement) {
    canSendMovement = false;
    const response = await fetch("/game/" + gameID, {
      method: "POST",
      body: JSON.stringify({ movement: movement }),
      headers: { "Content-Type": "application/json" },
    });
    const body = await response.json();
    if (response.ok) {
      board = parseBoard(body.board);
      players = body.players;
      setBoard();
      setClickable();
    }
    canSendMovement = true;
  }
}

function getCase(x, y) {
  return document.getElementById(`boardcase-${x}-${y}`);
}

function idToCoord(id) {
  const [x, y] = id.split("-").slice(1).map(Number);
  return [x, y];
}

function parseBoard(stringBoard) {
  const board = [];
  for (let x = 0; x < 5; x++) {
    const row = [];
    for (let y = 0; y < 5; y++) {
      row.push(parseInt(stringBoard[x * 5 + y], 10));
    }
    board.push(row);
  }
  return board;
}

function setBoard() {
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const boardCase = getCase(x, y);
      boardCase.innerText = "";
      switch (cell) {
        case 1:
          boardCase.classList.add("player1");
          boardCase.classList.remove("player2");
          break;
        case 2:
          boardCase.classList.add("player2");
          boardCase.classList.remove("player1");
          break;
        case 0:
        default:
          boardCase.classList.remove("player1");
          boardCase.classList.remove("player2");
          break;
      }
    });
  });
  players.forEach(([x, y], i) => {
    const boardCase = getCase(x, y);
    boardCase.innerText = i + 1;
  });
}

function setClickable() {
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        if (x > 0 && board[x - 1][y] !== 2) {
          const selectedCell = getCase(x - 1, y);
          selectedCell.classList.add("clickable");
          selectedCell.addEventListener("click", () => caseTrigger("left"));
        }
        if (x < 4 && board[x + 1][y] !== 2) {
          const selectedCell = getCase(x + 1, y);
          selectedCell.classList.add("clickable");
          selectedCell.addEventListener("click", () => caseTrigger("right"));
        }
        if (y > 0 && board[x][y - 1] !== 2) {
          const selectedCell = getCase(x, y - 1);
          selectedCell.classList.add("clickable");
          selectedCell.addEventListener("click", () => caseTrigger("up"));
        }
        if (y < 4 && board[x][y + 1] !== 2) {
          const selectedCell = getCase(x, y + 1);
          selectedCell.classList.add("clickable");
          selectedCell.addEventListener("click", () => caseTrigger("down"));
        }
      }
    });
  });
}

function placePlayer(player, [x, y]) {
  const boardCase = getCase(x, y);
  boardCase.innerText = player;
}

document.addEventListener("keydown", (event) => {
  event.preventDefault();
  const x = players[0][0];
  const y = players[0][1];
  const key = event.code;
  switch (key) {
    case "ArrowLeft":
    case "KeyA":
      if (x > 0 && board[x - 1][y] !== 2) {
        caseTrigger("left");
      }
      break;
    case "ArrowRight":
    case "KeyD":
      if (x < 4 && board[x + 1][y] !== 2) {
        caseTrigger("right");
      }
      break;
    case "ArrowUp":
    case "KeyW":
      if (y > 0 && board[0][y - 1] !== 2) {
        caseTrigger("up");
      }
      break;
    case "ArrowDown":
    case "KeyS":
      if (y < 4 && board[0][y + 1] !== 2) {
        caseTrigger("down");
      }
      break;
  }
});

window.addEventListener("DOMContentLoaded", function () {
  board = parseBoard(boardString);
  setBoard();
  setClickable();
});
