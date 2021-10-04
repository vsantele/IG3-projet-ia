let createGameBtn;

async function handleCreateGame() {
  console.log("gello");
  try {
    await createGame();
  } catch (err) {
    console.error(err);
  }
}

async function createGame() {
  let playerId = "user-1";
  const response = await fetch("/game", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerId }),
  });
  if (!response.ok) {
    const body = await response.json();
    console.error(body);
    throw new Error("Failed to create game");
  }
  if (response.redirected) {
    window.location.href = response.url;
  }
}

window.onload = function () {
  createGameBtn = document.getElementById("createGameBtn");

  createGameBtn.addEventListener("click", handleCreateGame);
};
