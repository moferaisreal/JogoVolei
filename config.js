const elements = {
  scoreInput: document.getElementById("scoreInput"),
  playersInput: document.getElementById("playersInput"),
  playerInput: document.getElementById("player"),
  playersList: document.getElementById("players"),
  ptsInput: document.getElementById("ptsInput"),
};

let config = JSON.parse(localStorage.getItem("volleyballConfig")) || {
  targetScore: [],
  participants: [],
  currentTeams: { team1: [], team2: [] },
};

function saveScore() {
  const newScore = parseInt(elements.scoreInput.value);
  if (isNaN(newScore) || newScore < 11 || newScore > 25) {
    showFeedback("Valor inválido! Use entre 11-25", "error");
    elements.scoreInput.value = config.targetScore;
    return;
  }

  config.targetScore = newScore;
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
  showFeedback("Pontuação salva!", "success");
}

function initConfig() {
  elements.scoreInput.value = config.targetScore;
  elements.playersInput.value = config.participants.length;
  updatePlayersList();
}

function updatePlayersList() {
  elements.playersList.innerHTML = config.participants
    .map(
      (player, index) => `
            <li data-index="${index}">
                ${player}
                <span class="delete-player">❌</span>
            </li>
        `
    )
    .join("");
}

function addPlayer() {
  const name = elements.playerInput.value.trim();
  if (name && !config.participants.includes(name)) {
    config.participants.push(name);
    elements.playerInput.value = "";
    updatePlayersList();
    saveConfig();
  }
}

function deletePlayer() {
  if (config.participants.length > 0) {
    config.participants.pop();
    updatePlayersList();
    saveConfig();
  }
}

function saveAll() {
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
  showFeedback("Todas configurações salvas!", "success");
  window.location.href = "index.html";
}

function showFeedback(message, type = "info") {
  const feedback = document.createElement("div");
  feedback.className = `feedback ${type}`;
  feedback.textContent = message;
  document.body.appendChild(feedback);

  setTimeout(() => feedback.remove(), 2000);
}

document.getElementById("player").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addPlayer();
});

elements.playersList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-player")) {
    const index = e.target.closest("li").dataset.index;
    config.participants.splice(index, 1);
    updatePlayersList();
    saveConfig();
  }
});

document
  .querySelector('[onclick="addPlayer()"]')
  .addEventListener("click", addPlayer);
document
  .querySelector('[onclick="deletePlayer()"]')
  .addEventListener("click", deletePlayer);
document
  .querySelector('[onclick="saveAll()"]')
  .addEventListener("click", saveAll);

document.addEventListener("DOMContentLoaded", initConfig);
