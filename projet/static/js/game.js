function caseTrigger(x, y) {
  console.log("click", x, y);
}

function getCase(x, y) {
  return document.getElementById(`boardcase-${x}-${y}`);
}

function setBoard({ board, players }) {
  board.forEach((row, x) => {
    row.forEach((cell, y) => {
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
  players.forEach((player, i) => {
    const boardCase = getCase(player.x, player.y);
    boardCase.innerText = i + 1;
  });
}

function placePlayer(player, { x, y }) {
  const boardCase = getCase(x, y);
  boardCase.innerText = player;
}
