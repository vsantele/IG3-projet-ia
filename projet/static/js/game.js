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

function endOfGame(winner){
  // 1: creeer le modal dans la page en html
  // ds le modal mettre des span avec les joueurs et nb de points
  // 2: actualiser les span avec les bonnes infos
  // 3: activer le modal == rajouter une classe is-active au modal

  // if(board.indexOf("0") != -1){
  //   console.log("La partie continue");
  // }
  // else{
  //   console.log(" !!! la partie est finie !!!")

    // player1Win = 0
    // player2Win = 0
    // for(let i=0;i<board.length;i++){
    //   if(board[i]=="1"){
    //     player1Win ++;
    //   }
    //   else{
    //     player2Win ++;
    //   }
    // }
    // if(player1Win>player2Win){
    //   // alert(` Player 1 Victory ! \n Avec ${player1Win} points, contre ${player2Win} points pour le joueur 2`)
      
    // }
    // else{
    //   // alert(` Player 2 Victory ! \n Avec ${player2Win} points, contre ${player1Win} points pour le joueur 1`)
    // }
  // }
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
        window.board = parseBoard(body.board);
        window.players = body.players;
        setBoard();
        if(body.winner!="0"){
          endOfGame(body.winner);
        }
        
        // setClickable();
      } else {
        console.log(body);
      }
    } catch (err) {
      console.error(err);
    } finally {
      canSendMovement = true;
    }
  }
}

document.addEventListener("keydown", (event) => {
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
});



window.addEventListener("DOMContentLoaded", () => {
  window.board = parseBoard(boardString);
  setBoard();
  // setClickable();
});
