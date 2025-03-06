let scores = {
  team1: 0,
  team2: 0,
};

//fallback for no configurations
let config = JSON.parse(localStorage.getItem("volleyballConfig")) || {
  targetScore: 25,
  playersPerTeam: 6,
  participants: [],
  currentTeams: { team1: [], team2: [] },
  serviceOrder: [],
};
function saveConfig() {
  localStorage.setItem("volleyballConfig", JSON.stringify(config));
}

const elements = {
  score1: document.getElementById("score1"),
  score2: document.getElementById("score2"),
  service1: document.getElementById("service1"),
  service2: document.getElementById("service2"),
  teamPlayers1: document.getElementById("team1-players"),
  teamPlayers2: document.getElementById("team2-players"),
  riotStarter: document.getElementById("riotStarter"),
};

function loadConfig() {
  const savedConfig = localStorage.getItem("volleyballConfig");
  if (!savedConfig) {
    config = {
      targetScore: 25,
      playersPerTeam: 6,
      participants: [],
      currentTeams: { team1: [], team2: [] },
      serviceOrder: [],
    };
    return;
  }

  try {
    config = JSON.parse(savedConfig);
    // Garantir estrutura mínima
    config.currentTeams = config.currentTeams || { team1: [], team2: [] };
    config.participants = config.participants || [];
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
    config = {
      // Fallback completo
      targetScore: 25,
      playersPerTeam: 6,
      participants: [],
      currentTeams: { team1: [], team2: [] },
      serviceOrder: [],
    };
  }
  updateUI();
}

function startFirstMatch() {
  const playersNeeded = config.playersPerTeam * 2;

  const firstPlayers = config.participants.slice(0, playersNeeded);

  if (firstPlayers.length < playersNeeded) {
    alert(`Adicione pelo menos ${playersNeeded} participantes!`);
    return;
  }

  const shuffledPlayers = [...firstPlayers];
  shuffleArray(shuffledPlayers);

  config.currentTeams = {
    team1: shuffledPlayers.slice(0, config.playersPerTeam),
    team2: shuffledPlayers.slice(config.playersPerTeam, playersNeeded),
  };

  config.serviceOrder =
    Math.random() < 0.5 ? ["team1", "team2"] : ["team2", "team1"];
  updateUI();
  saveConfig();
  console.log("Times formados:", config.currentTeams);
}

function updateUI() {
  elements.score1.textContent = scores.team1;
  elements.score2.textContent = scores.team2;

  const team1Players = Array.isArray(config.currentTeams.team1)
    ? config.currentTeams.team1
    : [];

  const team2Players = Array.isArray(config.currentTeams.team2)
    ? config.currentTeams.team2
    : [];

  elements.teamPlayers1.innerHTML = team1Players
    .map((player) => `<li>${player}</li>`)
    .join("");

  elements.teamPlayers2.innerHTML = team2Players
    .map((player) => `<li>${player}</li>`)
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

function initializeService() {
  if (config.serviceOrder.length === 0) {
    config.serviceOrder =
      Math.random() < 0.5 ? ["team1", "team2"] : ["team2", "team1"];
  }
}

function updateService(scoringTeam) {
  const currentService = config.serviceOrder[0];
  if (scoringTeam !== currentService) {
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

function checkVictory() {
  const diff = Math.abs(scores.team1 - scores.team2);
  const maxScore = Math.max(scores.team1, scores.team2);

  if (maxScore >= config.targetScore && diff >= 2) {
    const winner = scores.team1 > scores.team2 ? "team1" : "team2";
    const loserTeam =
      config.currentTeams[winner === "team1" ? "team2" : "team1"];

    setTimeout(() => {
      alert(`${config.currentTeams[winner].join(", ")} venceram!`);
      generateNewMatch(loserTeam);
    }, 100);
  }
}

function generateNewMatch(loserTeam) {
  loserTeam = Array.isArray(loserTeam) ? loserTeam : [];

  const remainingPlayers = [
    ...config.currentTeams.team1,
    ...config.currentTeams.team2,
  ].filter((player) => !loserTeam.includes(player));

  const orderedPlayers = [...remainingPlayers, ...loserTeam];

  config.currentTeams = {
    team1: orderedPlayers.slice(0, config.playersPerTeam),
    team2: orderedPlayers.slice(
      config.playersPerTeam,
      config.playersPerTeam * 2
    ),
  };

  const fillWithLosers = (team) => {
    const needed = config.playersPerTeam - team.length;
    return needed > 0 ? [...team, ...loserTeam.slice(-needed)] : team;
  };

  config.currentTeams.team1 = fillWithLosers(config.currentTeams.team1);
  config.currentTeams.team2 = fillWithLosers(config.currentTeams.team2);

  config.serviceOrder =
    Math.random() < 0.5 ? ["team1", "team2"] : ["team2", "team1"];

  scores = { team1: 0, team2: 0 };
  saveConfig();
  updateUI();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

document.getElementById("plusT1").addEventListener("click", () => {
  scores.team1++;
  updateService("team1");
  updateUI();
  checkVictory();
});

document.getElementById("plusT2").addEventListener("click", () => {
  scores.team2++;
  updateService("team2");
  updateUI();
  checkVictory();
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
  scores = { team1: 0, team2: 0 };
  updateUI();
});

elements.riotStarter.addEventListener("click", startFirstMatch);

loadConfig();
updateUI();
