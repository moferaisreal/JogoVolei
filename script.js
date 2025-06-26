// --- GLOBAL STATE ---
let scores = { team1: 0, team2: 0 };
let config = {}; // Master config from localStorage

// --- DOM ELEMENT REFERENCES ---
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

// --- CORE LOGIC ---

function saveConfig() {
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
}

function resetSessionState() {
  if (!config.participants) return;
  config.participants.forEach((player) => {
    player.gameState = player.status === "active" ? "waiting" : "resting";
  });
}

function startNewSession() {
  resetSessionState();

  const availablePlayers = config.participants.filter(
    (p) => p.status === "active"
  );
  const playersNeeded = config.playersPerTeam * 2;

  if (availablePlayers.length < playersNeeded) {
    alert(
      `São necessários pelo menos ${playersNeeded} jogadores 'ativos' para começar.`
    );
    return;
  }

  shuffleArray(availablePlayers);

  const inactivePlayers = config.participants.filter(
    (p) => p.status === "inactive"
  );
  config.participants = [...availablePlayers, ...inactivePlayers];

  const playersForFirstMatch = availablePlayers.slice(0, playersNeeded);
  playersForFirstMatch.forEach((p) => (p.gameState = "playing"));

  config.currentTeams = {
    team1: playersForFirstMatch.slice(0, config.playersPerTeam),
    team2: playersForFirstMatch.slice(config.playersPerTeam, playersNeeded),
  };

  scores = { team1: 0, team2: 0 };
  config.serviceOrder =
    Math.random() < 0.5 ? ["team1", "team2"] : ["team2", "team1"];

  saveConfig();
  updateUI();
}

/**
 * [NEW IMPLEMENTATION] Generates the next match using the "Temporary Array" logic.
 */
function generateNewMatch() {
  hideVictoryModal();

  // Step 1: Isolate Winners and Losers into temporary arrays.
  const winnerTeamKey = scores.team1 > scores.team2 ? "team1" : "team2";
  const winnersArray = [...config.currentTeams[winnerTeamKey]];
  const losersArray = [
    ...config.currentTeams[winnerTeamKey === "team1" ? "team2" : "team1"],
  ];

  // Create a Set of names for players who just played, for easy filtering.
  const playingPlayerNames = new Set(
    [...winnersArray, ...losersArray].map((p) => p.name)
  );

  // The "main array" now consists of everyone who was NOT on the court.
  const mainPool = config.participants.filter(
    (p) => !playingPlayerNames.has(p.name)
  );

  // Step 2: Draft New Challengers from the main pool.
  const challengersNeeded = config.playersPerTeam * 2 - winnersArray.length;

  // The draft pool is only players who are waiting (active status).
  const waitingPool = mainPool.filter((p) => p.status === "active");

  if (waitingPool.length < challengersNeeded) {
    alert("Não há jogadores suficientes na fila para a próxima partida!");
    return;
  }

  const newChallengers = waitingPool.slice(0, challengersNeeded);

  // Step 3: Form the New Match.
  const playersForNextMatch = [...winnersArray, ...newChallengers];
  playersForNextMatch.forEach((p) => (p.gameState = "playing")); // Update state for all players in the next match.
  shuffleArray(playersForNextMatch);

  config.currentTeams = {
    team1: playersForNextMatch.slice(0, config.playersPerTeam),
    team2: playersForNextMatch.slice(config.playersPerTeam),
  };

  // Step 4: Rebuild the Master Array in the correct order.
  const remainingWaiting = waitingPool.slice(challengersNeeded);
  const inactivePlayers = mainPool.filter((p) => p.status === "inactive");

  // Set the losers' state back to 'waiting' before adding them to the end of the queue.
  losersArray.forEach((p) => (p.gameState = "waiting"));

  config.participants = [
    ...playersForNextMatch, // Players in the new match are at the front.
    ...remainingWaiting, // The rest of the waiting queue.
    ...losersArray, // The losers are now at the back of the queue.
    ...inactivePlayers, // Inactive players are last.
  ];

  // Step 5: Reset scores and save the new state.
  scores = { team1: 0, team2: 0 };
  config.serviceOrder =
    Math.random() < 0.5 ? ["team1", "team2"] : ["team2", "team1"];

  saveConfig();
  updateUI();
}

// --- UI AND DISPLAY FUNCTIONS ---

function updateUI() {
  elements.score1.textContent = scores.team1;
  elements.score2.textContent = scores.team2;

  const team1Players = config.currentTeams.team1 || [];
  const team2Players = config.currentTeams.team2 || [];

  elements.teamPlayers1.innerHTML = team1Players
    .map((player) => `<li>${player.name}</li>`)
    .join("");
  elements.teamPlayers2.innerHTML = team2Players
    .map((player) => `<li>${player.name}</li>`)
    .join("");

  document
    .getElementById("team1")
    .querySelector(
      "h2"
    ).textContent = `Time 1 (${team1Players.length} jogadores)`;
  document
    .getElementById("team2")
    .querySelector(
      "h2"
    ).textContent = `Time 2 (${team2Players.length} jogadores)`;

  updateService();
}

function updateService(scoringTeam) {
  if (
    config.serviceOrder &&
    config.serviceOrder.length > 0 &&
    scoringTeam &&
    config.serviceOrder[0] !== scoringTeam
  ) {
    config.serviceOrder.push(config.serviceOrder.shift());
  }
  elements.service1.classList.toggle(
    "active",
    config.serviceOrder && config.serviceOrder[0] === "team1"
  );
  elements.service2.classList.toggle(
    "active",
    config.serviceOrder && config.serviceOrder[0] === "team2"
  );
}

function checkVictory() {
  if (!config.targetScore) return;

  const diff = Math.abs(scores.team1 - scores.team2);
  const maxScore = Math.max(scores.team1, scores.team2);

  if (maxScore >= config.targetScore && diff >= 2) {
    const winner = scores.team1 > scores.team2 ? "team1" : "team2";
    setTimeout(() => showVictoryModal(winner), 300);
  }
}

function showVictoryModal(winner) {
  const winnerNames = config.currentTeams[winner].map((p) => p.name).join(", ");
  elements.winnerMessage.textContent = `${winnerNames} venceram!`;
  elements.victoryOverlay.classList.add("visible");
  elements.victoryModal.classList.add("visible");
}

function hideVictoryModal() {
  elements.victoryOverlay.classList.remove("visible");
  elements.victoryModal.classList.remove("visible");
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --- EVENT LISTENERS ---

elements.newMatchBtn.addEventListener("click", generateNewMatch);

elements.riotStarter.addEventListener("click", () => {
  if (
    confirm(
      "Isso irá resetar a sessão, embaralhar todos os jogadores ATIVOS e iniciar uma nova partida com as configurações atuais. Deseja continuar?"
    )
  ) {
    startNewSession();
  }
});

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
document.getElementById("minusT1").addEventListener("click", () => {
  scores.team1 = Math.max(0, scores.team1 - 1);
  updateUI();
});
document.getElementById("minusT2").addEventListener("click", () => {
  scores.team2 = Math.max(0, scores.team2 - 1);
  updateUI();
});
document.getElementById("refreshbtn").addEventListener("click", () => {
  if (confirm("Tem certeza que quer zerar o placar?")) {
    scores = { team1: 0, team2: 0 };
    updateUI();
  }
});

// --- INITIALIZATION ---

function loadConfig() {
  const savedConfig = localStorage.getItem("volleyballConfig");
  const defaultConfig = {
    targetScore: 15,
    playersPerTeam: 2,
    participants: [],
    currentTeams: { team1: [], team2: [] },
    serviceOrder: [],
  };

  if (savedConfig) {
    config = { ...defaultConfig, ...JSON.parse(savedConfig) };
  } else {
    config = defaultConfig;
    saveConfig();
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "volleyballConfig") {
      // A simple page reload is the safest way to apply changes from another tab.
      window.location.reload();
    }
  });

  updateUI();
}

// Load the application.
loadConfig();
