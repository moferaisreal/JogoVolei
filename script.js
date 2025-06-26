// Fallback for initial configuration
let scores = {
  team1: 0,
  team2: 0,
};

let config = JSON.parse(localStorage.getItem("volleyballConfig")) || {
  targetScore: 25,
  playersPerTeam: 6,
  participants: [],
  currentTeams: { team1: [], team2: [] },
  serviceOrder: [],
};

// Function to save the current configuration to localStorage
function saveConfig() {
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
}

// Object to hold references to key DOM elements
const elements = {
  score1: document.getElementById("score1"),
  score2: document.getElementById("score2"),
  service1: document.getElementById("service1"),
  service2: document.getElementById("service2"),
  teamPlayers1: document.getElementById("team1-players"),
  teamPlayers2: document.getElementById("team2-players"),
  riotStarter: document.getElementById("riotStarter"),
  victoryModal: document.getElementById("victoryModal"),
  victoryOverlay: document.getElementById("victoryOverlay"),
  winnerMessage: document.getElementById("winner-message"),
  newMatchBtn: document.getElementById("newMatchBtn"),
};

// --- CORE GAME LOGIC ---

/**
 * Starts the very first match by shuffling all participants and creating two teams.
 */
function startFirstMatch() {
  const playersNeeded = config.playersPerTeam * 2;

  if (config.participants.length < playersNeeded) {
    alert(
      `Adicione pelo menos ${playersNeeded} participantes na página de Configuração!`
    );
    return;
  }

  shuffleArray(config.participants);

  const firstPlayers = config.participants.slice(0, playersNeeded);

  config.currentTeams = {
    team1: firstPlayers.slice(0, config.playersPerTeam),
    team2: firstPlayers.slice(config.playersPerTeam, playersNeeded),
  };

  scores = { team1: 0, team2: 0 };
  config.serviceOrder =
    Math.random() < 0.5 ? ["team1", "team2"] : ["team2", "team1"];

  saveConfig();
  updateUI();
}

/**
 * THIS IS THE CORRECTED FUNCTION.
 * It starts a new match after a victory, implementing the "King of the Court" rule.
 */
function generateNewMatch() {
  hideVictoryModal();

  // 1. Identify winner and loser teams (these are arrays of player objects).
  const winnerTeamKey = scores.team1 > scores.team2 ? "team1" : "team2";
  const winners = config.currentTeams[winnerTeamKey];
  const losers =
    config.currentTeams[winnerTeamKey === "team1" ? "team2" : "team1"];

  // 2. Create a set of names for players who just finished the match.
  const playingPlayerNames = new Set(
    [...winners, ...losers].map((p) => p.name)
  );

  // 3. Get a clean list of all players who were waiting.
  const waitingPlayers = config.participants.filter(
    (p) => !playingPlayerNames.has(p.name)
  );

  // 4. Form the new queue of available players. Losers go to the back of the line.
  const playerQueue = [...waitingPlayers, ...losers];

  // 5. The winners stay. We pick new challengers from the front of the queue.
  const challengersNeeded = config.playersPerTeam * 2 - winners.length;
  const challengers = playerQueue.slice(0, challengersNeeded); // Use slice (non-destructive)

  // 6. The players for the next match are the winners plus the new challengers.
  const nextMatchPlayers = [...winners, ...challengers];
  shuffleArray(nextMatchPlayers);

  // 7. Assign the new teams.
  config.currentTeams = {
    team1: nextMatchPlayers.slice(0, config.playersPerTeam),
    team2: nextMatchPlayers.slice(config.playersPerTeam),
  };

  // 8. Reconstruct the master participant list in the new order for the next round.
  const remainingQueue = playerQueue.slice(challengersNeeded);
  config.participants = [...nextMatchPlayers, ...remainingQueue];

  // 9. Reset scores, save the new state, and update the display.
  scores = { team1: 0, team2: 0 };
  config.serviceOrder =
    Math.random() < 0.5 ? ["team1", "team2"] : ["team2", "team1"];

  saveConfig();
  updateUI();
}

// --- UI AND DISPLAY FUNCTIONS ---

/**
 * Updates the entire UI with current scores, teams, and service.
 */
function updateUI() {
  elements.score1.textContent = scores.team1;
  elements.score2.textContent = scores.team2;

  // Correctly displays player names from the player objects.
  elements.teamPlayers1.innerHTML = config.currentTeams.team1
    .map((player) => `<li>${player.name}</li>`)
    .join("");
  elements.teamPlayers2.innerHTML = config.currentTeams.team2
    .map((player) => `<li>${player.name}</li>`)
    .join("");

  document
    .getElementById("team1")
    .querySelector(
      "h2"
    ).textContent = `Time 1 (${config.currentTeams.team1.length} jogadores)`;
  document
    .getElementById("team2")
    .querySelector(
      "h2"
    ).textContent = `Time 2 (${config.currentTeams.team2.length} jogadores)`;

  updateService();
}

/**
 * Shows or hides the service indicator for the correct team.
 */
function updateService(scoringTeam) {
  if (scoringTeam && config.serviceOrder[0] !== scoringTeam) {
    config.serviceOrder.push(config.serviceOrder.shift());
  }
  elements.service1.classList.toggle(
    "active",
    config.serviceOrder[0] === "team1"
  );
  elements.service2.classList.toggle(
    "active",
    config.serviceOrder[0] === "team2"
  );
}

/**
 * Checks if a team has reached the target score with a 2-point lead.
 */
function checkVictory() {
  const diff = Math.abs(scores.team1 - scores.team2);
  const maxScore = Math.max(scores.team1, scores.team2);

  if (maxScore >= config.targetScore && diff >= 2) {
    const winner = scores.team1 > scores.team2 ? "team1" : "team2";
    setTimeout(() => showVictoryModal(winner), 300);
  }
}

/**
 * Displays the victory modal with the winning team's names.
 */
function showVictoryModal(winner) {
  const winnerNames = config.currentTeams[winner].map((p) => p.name).join(", ");
  elements.winnerMessage.textContent = `${winnerNames} venceram!`;
  elements.victoryOverlay.classList.add("visible");
  elements.victoryModal.classList.add("visible");
}

/**
 * Hides the victory modal and overlay.
 */
function hideVictoryModal() {
  elements.victoryOverlay.classList.remove("visible");
  elements.victoryModal.classList.remove("visible");
}

// --- UTILITY FUNCTIONS ---

/**
 * Shuffles an array in place (Fisher-Yates shuffle).
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --- EVENT LISTENERS ---

// Listener for the "New Match" button on the victory modal.
elements.newMatchBtn.addEventListener("click", generateNewMatch);

// Listeners for scoring buttons
document.getElementById("plusT1").addEventListener("click", () => {
  scores.team1++;
  elements.score1.parentElement.classList.add("score-update");
  updateService("team1");
  updateUI();
  checkVictory();
  setTimeout(
    () => elements.score1.parentElement.classList.remove("score-update"),
    400
  );
});

document.getElementById("plusT2").addEventListener("click", () => {
  scores.team2++;
  elements.score2.parentElement.classList.add("score-update");
  updateService("team2");
  updateUI();
  checkVictory();
  setTimeout(
    () => elements.score2.parentElement.classList.remove("score-update"),
    400
  );
});

// Listeners for minus buttons
document.getElementById("minusT1").addEventListener("click", () => {
  scores.team1 = Math.max(0, scores.team1 - 1);
  updateUI();
});

document.getElementById("minusT2").addEventListener("click", () => {
  scores.team2 = Math.max(0, scores.team2 - 1);
  updateUI();
});

// Listener for the "Start/Shuffle All" button
elements.riotStarter.addEventListener("click", () => {
  if (
    confirm(
      "Isso irá embaralhar todos os jogadores e iniciar uma nova partida. Deseja continuar?"
    )
  ) {
    startFirstMatch();
  }
});

// Listener for the reset score button
document.getElementById("refreshbtn").addEventListener("click", () => {
  if (confirm("Tem certeza que quer zerar o placar?")) {
    scores = { team1: 0, team2: 0 };
    updateUI();
  }
});

// --- INITIAL LOAD ---
// Load config from localStorage and update the UI when the page loads.
function loadConfig() {
  const savedConfig = localStorage.getItem("volleyballConfig");
  if (savedConfig) {
    config = JSON.parse(savedConfig);
  }
  // Ensure all parts of the config object exist to prevent errors
  config.currentTeams = config.currentTeams || { team1: [], team2: [] };
  config.participants = config.participants || [];
  config.serviceOrder = config.serviceOrder || [];
  updateUI();
}

loadConfig();
