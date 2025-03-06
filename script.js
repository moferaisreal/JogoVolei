let scores = {
  team1: 0,
  team2: 0,
};

//fallback for no configurations
let config = JSON.parse(localStorage.getItem("volleyballConfig")) || {
  targetScore: 25,
  playersPerTeam: 6,
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
};

function loadConfig() {
  const savedConfig = localStorage.getItem("volleyballConfig");
  if (savedConfig) {
    config = JSON.parse(savedConfig);
    updateUI();
  }
}

function updateUI() {
  elements.score1.textContent = scores.team1;
  elements.score2.textContent = scores.team2;

  elements.teamPlayers1.innerHTML = config.currentTeams.team1
    .map((player) => `<li>${player}</li>`)
    .join("");

  elements.teamPlayers2.innerHTML = config.currentTeams.team2
    .map((player) => `<li>${player}</li>`)
    .join("");
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
  const remainingPlayers = [
    ...config.currentTeams.team1,
    ...config.currentTeams.team2,
  ].filter((player) => !loserTeam.includes(player));

  const allPlayers = [...remainingPlayers, ...loserTeam];

  shuffleArray(remainingPlayers);

  config.currentTeams = {
    team1: remainingPlayers.slice(0, config.playersPerTeam),
    team2: [...remainingPlayers.slice(config.playersPerTeam), ...loserTeam],
  };

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

loadConfig();
updateUI();
