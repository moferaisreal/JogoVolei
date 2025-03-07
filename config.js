const elements = {
  scoreInput: document.getElementById("scoreInput"),
  playersInput: document.getElementById("playersInput"),
  playerInput: document.getElementById("player"),
  playersList: document.getElementById("players"),
  ptsInput: document.getElementById("ptsInput"),
  savePlayersBtn: document.getElementById("savePlayers"),
};

let config = JSON.parse(localStorage.getItem("volleyballConfig")) || {
  targetScore: 11,
  playersPerTeam: 2,
  participants: [],
  currentTeams: { team1: [], team2: [] },
  serviceOrder: [],
};

function saveScore() {
  const newScore = parseInt(elements.scoreInput.value);
  if (isNaN(newScore)) {
    showFeedback("Valor inválido!", "error");
    elements.scoreInput.value = config.targetScore;
    return;
  }

  config.targetScore = Math.min(25, Math.max(11, newScore));
  elements.scoreInput.value = config.targetScore;
  saveConfig();
  showFeedback("Pontuação salva!", "success");
}

function savePlayers() {
  const selectedValue = parseInt(elements.playersInput.value);
  if (isNaN(selectedValue) || selectedValue < 2 || selectedValue > 6) {
    showFeedback("Número inválido! Use entre 2-6", "error");
    elements.playersInput.value = config.playersPerTeam;
    return;
  }

  config.playersPerTeam = selectedValue;
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
  showFeedback(
    `Configuração salva: ${selectedValue} jogadores/time`,
    "success"
  );
}

function saveConfig() {
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
}

function addPlayer() {
  const name = elements.playerInput.value.trim();
  if (!name) return;

  if (!config.participants.includes(name)) {
    config.participants.push(name);
    elements.playerInput.value = "";
    updatePlayersList();
    saveConfig();
    showFeedback("Jogador adicionado!", "success");
  }
  updateUI();
}

function updatePlayersList() {
  const participants = Array.isArray(config.participants)
    ? config.participants
    : [];

  elements.playersList.innerHTML = participants
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

function showFeedback(message, type = "info") {
  const feedback = document.createElement("div");
  feedback.className = `feedback ${type}`;
  feedback.textContent = message;
  document.body.appendChild(feedback);

  setTimeout(() => feedback.remove(), 2000);
}

function deletePlayer() {
  if (config.participants.length > 0) {
    config.participants.pop();
    updatePlayersList();
    saveConfig();
    showFeedback("Último jogador removido!", "info");
  }
  updateUI();
}

document.addEventListener("DOMContentLoaded", () => {
  elements.scoreInput.value = config.targetScore;
  elements.playersInput.value = config.playersPerTeam;
  updatePlayersList();

  elements.ptsInput.addEventListener("click", saveScore);
  elements.scoreInput.addEventListener("change", saveScore);

  elements.savePlayersBtn.addEventListener("click", savePlayers);
  elements.playersInput.addEventListener("change", savePlayers);

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
    .addEventListener("click", () => {
      saveConfig();
      showFeedback("Todas configurações salvas!", "success");
      window.location.href = "index.html";
    });
});
