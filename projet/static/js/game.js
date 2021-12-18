/*global bulmaToast*/
let canSendMovement = true;

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
  window.board.forEach((row, y) => {
    row.forEach((cell, x) => {
      const boardCase = getCase(x, y);
      boardCase.classList.remove("clickable", "player1", "player2");
      boardCase.innerText = "";
      switch (cell) {
        case 1:
          boardCase.classList.add("player1");
          break;
        case 2:
          boardCase.classList.add("player2");
          break;
        case 0:
        default:
          break;
      }
    });
  });
  window.players.forEach(([x, y], i) => {
    const boardCase = getCase(x, y);
    boardCase.innerText = i + 1;
  });
}

// function setClickable() {
//   const x = window.players[0][0];
//   const y = window.players[0][1];

//   if (x > 0 && window.board[y][x - 1] !== 2) {
//     const selectedCell = getCase(x - 1, y);
//     selectedCell.classList.add("clickable");
//     selectedCell.innerHTML = "left";
//     selectedCell.addEventListener("click", () => caseTrigger("left"));
//   }
//   if (x < 4 && window.board[y][x + 1] != 2) {
//     const selectedCell = getCase(x + 1, y);
//     selectedCell.classList.add("clickable");
//     selectedCell.innerHTML = "right";
//     selectedCell.addEventListener("click", () => caseTrigger("right"));
//   }
//   if (y > 0 && window.board[y - 1][x]) {
//     const selectedCell = getCase(x, y - 1);
//     selectedCell.classList.add("clickable");
//     selectedCell.innerHTML = "up";
//     selectedCell.addEventListener("click", () => caseTrigger("up"));
//   }
//   if (y < 4 && window.board[y + 1][x]) {
//     const selectedCell = getCase(x, y + 1);
//     selectedCell.classList.add("clickable");
//     selectedCell.innerHTML = "down";
//     selectedCell.addEventListener("click", () => caseTrigger("down"));
//   }
// }

function placePlayer(player, [x, y]) {
  const boardCase = getCase(x, y);
  boardCase.innerText = player;
}

function countCases(winner, board) {
  let nbPoints = 0;
  for (let i = 0; i < board.length; i++) {
    if (board[i] == winner) {
      nbPoints++;
    }
  }
  return nbPoints;
}

function reactOnEvent(event) {
  const [x, y] = window.players[0];
  const key = event.code;
  switch (key) {
    case "ArrowLeft":
    case "KeyA":
      event.preventDefault();
      if (x > 0 && window.board[y][x - 1] !== 2) {
        caseTrigger("left");
      }
      break;
    case "ArrowRight":
    case "KeyD":
      event.preventDefault();
      if (x < 4 && window.board[y][x + 1] !== 2) {
        caseTrigger("right");
      }
      break;
    case "ArrowUp":
    case "KeyW":
      event.preventDefault();
      if (y > 0 && window.board[y - 1][x] !== 2) {
        caseTrigger("up");
      }
      break;
    case "ArrowDown":
    case "KeyS":
      event.preventDefault();
      if (y < 4 && window.board[y + 1][x] !== 2) {
        caseTrigger("down");
      }
      break;
  }
}

function endOfGame(body) {
  // 0: désactiver les flèches
  document.removeEventListener("keydown", reactOnEvent);

  // 1: creer le modal dans la page en html
  // et ds le modal mettre des span avec les joueurs et nb de points
  const winner = document.getElementById("winner");
  const playerCells = document.getElementById("player-cells");
  const boardSize = document.getElementById("board-size");
  const winnerSubtitle = document.getElementById("winner-subtitle");

  // 2: actualiser les span avec les bonnes infos
  winner.innerText = youWinOrLoose(body.winner);
  winnerSubtitle.innerText = youWinOrLoose(body.winner);
  playerCells.innerText = countCases(1, body.board);
  boardSize.innerText = body.board.length;
  // 3: activer le modal == rajouter une classe is-active au modal
  toggleModal(true);
}

function youWinOrLoose(winner) {
  if (winner === 1) {
    return "You win !";
  } else if (winner === 2) {
    return "You loose !";
  }
  return "";
}

async function caseTrigger(movement) {
  if (canSendMovement) {
    canSendMovement = false;
    try {
      const response = await fetch(`/game/${window.gameID}`, {
        method: "POST",
        body: JSON.stringify({ movement }),
        headers: { "Content-Type": "application/json" },
      });
      const body = await response.json();
      if (response.ok) {
        window.boardString = body.board;
        window.board = parseBoard(body.board);
        window.players = body.players;
        window.winner = body.winner;
        setBoard();
        if (body.winner != "0") {
          endOfGame(body);
        }

        // setClickable();
      } else {
        bulmaToast.toast({
          message: body.message,
          type: "is-danger",
          position: "top-center",
        });
        console.log(body);
      }
    } catch (err) {
      bulmaToast.toast({
        message: "Une erreur inconnue est survenue",
        type: "is-danger",
        position: "top-center",
      });
      console.error(err);
    } finally {
      canSendMovement = true;
    }
  }
}

function toggleModal(state) {
  const modal = document.getElementById("winner-modal");
  modal.classList.toggle("is-active", state);
}

window.addEventListener("DOMContentLoaded", () => {
  window.board = parseBoard(window.boardString);
  setBoard();
  if (window.winner == 0) {
    document.addEventListener("keydown", reactOnEvent);
  }
  document.getElementById("go-home", () => {
    window.location.href = "/";
  });
  document
    .getElementById("view-board")
    .addEventListener("click", () => toggleModal(false));

  // setClickable();
});

async function send_help() {
  let state = state_str();
  try {
    const response = await fetch(`/game/hint?state=${state}`, {
      method: "GET",
    });
    const data = await response.json();
    if (response.ok) {
      bulmaToast.toast({
        message: "the best move is : " + data.move,
        type: "is-success",
        position: "top-center",
      });
    } else {
      bulmaToast.toast({
        message: data.message,
        type: "is-danger",
        position: "top-center",
      });
    }
  } catch (err) {
    bulmaToast.toast({
      message: "Une erreur inconnue est survenue",
      type: "is-danger",
      position: "top-center",
    });
    console.error(err);
  }
}
function state_str() {
  
  
  return (
    window.boardString +
    window.players[0][0] +
    window.players[0][1] +
    window.players[1][0] +
    window.players[1][1] +
    "1"
  );
}
