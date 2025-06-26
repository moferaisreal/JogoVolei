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
// Loads configuration from localStorage or sets a default.
let config = JSON.parse(localStorage.getItem("volleyballConfig")) || {
  targetScore: 15,
  playersPerTeam: 2,
  participants: [],
  currentTeams: { team1: [], team2: [] },
  serviceOrder: [],
};

// --- CORE FUNCTIONS ---

/**
 * Saves the entire config object to localStorage.
 */
function saveConfig() {
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
}

/**
 * Updates the target score in the config object and saves.
 */
function saveScore() {
  const newScore = parseInt(elements.scoreInput.value);
  if (!isNaN(newScore)) {
    config.targetScore = newScore;
    saveConfig();
  }
}

/**
 * Updates the players-per-team setting in the config object and saves.
 */
function savePlayers() {
  const newPlayersPerTeam = parseInt(elements.playersInput.value);
  if (!isNaN(newPlayersPerTeam)) {
    config.playersPerTeam = newPlayersPerTeam;
    saveConfig();
  }
}

/**
 * Adds a new player to the participants list.
 */
function addPlayer() {
  const name = elements.playerInput.value.trim();
  if (!name) {
    showFeedback("O nome do jogador não pode estar vazio.", "error");
    return;
  }

  // Check if player already exists (case-insensitive)
  const playerExists = config.participants.some(
    (player) => player.name.toLowerCase() === name.toLowerCase()
  );

  if (playerExists) {
    showFeedback("Este jogador já foi adicionado.", "error");
    return;
  }

  config.participants.push({ name: name, status: "inactive" });
  elements.playerInput.value = ""; // Clear the input field
  updatePlayersList();
  saveConfig();
  showFeedback("Jogador adicionado!", "success");
  elements.playerInput.focus(); // Keep focus on the input for easy multi-add
}

/**
 * Re-renders the list of players in the UI.
 * This is now corrected to display player names properly.
 */
function updatePlayersList() {
  elements.playersList.innerHTML = config.participants
    .map(
      (player, index) => `
      <li data-index="${index}">
        <span>${player.name}</span>
        <span class="delete-player">❌</span>
      </li>
    `
    )
    .join("");
}

/**
 * Displays a temporary feedback message (popup) at the bottom of the screen.
 * @param {string} message - The text to display.
 * @param {string} type - 'success' or 'error'.
 */
function showFeedback(message, type = "info") {
  const feedback = document.createElement("div");
  feedback.className = `feedback ${type}`;
  feedback.textContent = message;
  document.body.appendChild(feedback);

  setTimeout(() => feedback.remove(), 2500);
}

// --- INITIALIZATION AND EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  // Migrate old data structure if necessary (from string array to object array)
  if (
    config.participants.length > 0 &&
    typeof config.participants[0] === "string"
  ) {
    config.participants = config.participants.map((name) => ({
      name: name,
      status: "inactive",
    }));
    saveConfig();
  }

  // Set initial values from loaded config
  elements.scoreInput.value = config.targetScore;
  elements.playersInput.value = config.playersPerTeam;
  updatePlayersList();

  // --- Attach Event Listeners ---

  // Save settings automatically when they are changed
  elements.scoreInput.addEventListener("change", saveScore);
  elements.playersInput.addEventListener("change", savePlayers);

  // Add player via button click
  elements.addPlayerBtn.addEventListener("click", addPlayer);

  // Add player by pressing "Enter" in the input field
  elements.playerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent any default form submission behavior
      addPlayer();
    }
  });

  // Delete a player by clicking the '❌' icon (using event delegation)
  elements.playersList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-player")) {
      // Find the parent <li> to get the data-index
      const playerLi = e.target.closest("li");
      if (playerLi) {
        const index = playerLi.dataset.index;
        config.participants.splice(index, 1); // Remove the player
        updatePlayersList();
        saveConfig();
        showFeedback("Jogador removido.", "info");
      }
    }
  });

  // Save all settings and return to the main page
  elements.saveAllBtn.addEventListener("click", () => {
    saveConfig();
    showFeedback("Configurações salvas!", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500); // A small delay so the user can see the feedback
  });
});
