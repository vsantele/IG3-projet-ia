function caseTrigger(x, y) {
  console.log("click", x, y);
}

function getCase(x, y) {
  return document.getElementById(`boardcase-${x}-${y}`);
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

function setBoard({ board, players }) {
  console.log("board :>> ", board);
  board.forEach((row, x) => {
    row.forEach((cell, y) => {
      console.log("x, y :>> ", x, y);
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

function placePlayer(player, [x, y]) {
  const boardCase = getCase(x, y);
  boardCase.innerText = player;
}
