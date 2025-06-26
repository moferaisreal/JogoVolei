// --- DOM ELEMENT REFERENCES ---
const elements = {
  scoreInput: document.getElementById("scoreInput"),
  playersInput: document.getElementById("playersInput"),
  playerInput: document.getElementById("player"),
  playersList: document.getElementById("players"),
  addPlayerBtn: document.getElementById("addPlayerBtn"),
  saveAllBtn: document.getElementById("saveAllBtn"),
};

// --- CONFIGURATION OBJECT ---
let config = JSON.parse(localStorage.getItem("volleyballConfig")) || {
  targetScore: 15,
  playersPerTeam: 2,
  participants: [],
  currentTeams: { team1: [], team2: [] },
  serviceOrder: [],
};

// --- CORE FUNCTIONS ---

function saveConfig() {
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
}

function saveScore() {
  const newScore = parseInt(elements.scoreInput.value);
  if (!isNaN(newScore)) {
    config.targetScore = newScore;
    saveConfig();
  }
}

function savePlayers() {
  const newPlayersPerTeam = parseInt(elements.playersInput.value);
  if (!isNaN(newPlayersPerTeam)) {
    config.playersPerTeam = newPlayersPerTeam;
    saveConfig();
  }
}

function addPlayer() {
  const name = elements.playerInput.value.trim();
  if (!name) {
    showFeedback("O nome do jogador não pode estar vazio.", "error");
    return;
  }

  const playerExists = config.participants.some(
    (player) => player.name.toLowerCase() === name.toLowerCase()
  );

  if (playerExists) {
    showFeedback("Este jogador já foi adicionado.", "error");
    return;
  }

  config.participants.push({
    name: name,
    status: "active",
    gameState: "waiting",
  });
  elements.playerInput.value = "";
  updatePlayersList();
  saveConfig();
  showFeedback("Jogador adicionado!", "success");
  elements.playerInput.focus();
}

/**
 * MODIFIED: Re-renders the player list using a unique 'data-name' attribute for identification.
 */
function updatePlayersList() {
  elements.playersList.innerHTML = config.participants
    .map((player) => {
      const isChecked = player.status === "active" ? "checked" : "";
      // Using player.name as the unique identifier is more robust than using the array index.
      return `
          <li class="list-group-item d-flex justify-content-between align-items-center" data-name="${player.name}">
            <span>${player.name}</span>
            <div class="player-controls">
              <div class="form-check form-switch">
                <input class="form-check-input status-toggle" type="checkbox" role="switch" ${isChecked} title="Toggle player status">
              </div>
              <span class="delete-player" title="Delete player">❌</span>
            </div>
          </li>
        `;
    })
    .join("");
}

function showFeedback(message, type = "info") {
  const feedback = document.createElement("div");
  feedback.className = `feedback ${type}`;
  feedback.textContent = message;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 2500);
}

// --- INITIALIZATION AND EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  elements.scoreInput.value = config.targetScore;
  elements.playersInput.value = config.playersPerTeam;
  updatePlayersList();

  // --- Attach Event Listeners ---

  elements.scoreInput.addEventListener("change", saveScore);
  elements.playersInput.addEventListener("change", savePlayers);
  elements.addPlayerBtn.addEventListener("click", addPlayer);
  elements.playerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPlayer();
    }
  });

  /**
   * MODIFIED: Event listener now uses 'data-name' to find the correct player before taking action.
   * This is the definitive fix for the delete functionality.
   */
  elements.playersList.addEventListener("click", (e) => {
    const target = e.target;
    const playerLi = target.closest("li");

    if (!playerLi) return;

    // Find the player in the array using their unique name from the data-attribute.
    const playerName = playerLi.dataset.name;
    const playerIndex = config.participants.findIndex(
      (p) => p.name === playerName
    );

    // If for some reason the player isn't found, do nothing.
    if (playerIndex === -1) return;

    const player = config.participants[playerIndex];

    // Handle Toggling Status
    if (target.classList.contains("status-toggle")) {
      if (target.checked) {
        player.status = "active";
        player.gameState = "waiting";
        showFeedback(`${player.name} está na fila.`, "info");
      } else {
        player.status = "inactive";
        player.gameState = "resting";
        showFeedback(`${player.name} está descansando.`, "info");
      }
      saveConfig();
    }

    // Handle Deleting a Player
    if (target.classList.contains("delete-player")) {
      // Remove the player using the found index.
      config.participants.splice(playerIndex, 1);
      updatePlayersList();
      saveConfig();
      showFeedback(`${playerName} foi removido.`, "info");
    }
  });

  elements.saveAllBtn.addEventListener("click", () => {
    saveConfig();
    showFeedback("Configurações salvas!", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);
  });
});
