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

function updateService() {
  const totalPoints = scores.team1 + scores.team2;
  const serviceIndex = totalPoints === 0 ? 0 : totalPoints % 2;
  const currentService = config.serviceOrder[serviceIndex];

  elements.service1.classList.toggle("active", currentService === "team1");
  elements.service2.classList.toggle("active", currentService === "team2");
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
  const allPlayers = [
    ...config.currentTeams.team1,
    ...config.currentTeams.team2,
    ...loserTeam,
  ];
  const uniquePlayers = [...new Set(allPlayers)];
  shuffleArray(uniquePlayers);
  const half = Math.ceil(uniquePlayers.length / 2);
  config.currentTeams = {
    team1: uniquePlayers.slice(0, half),
    team2: uniquePlayers.slice(half),
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
  updateUI();
  checkVictory();
});

document.getElementById("plusT2").addEventListener("click", () => {
  scores.team2++;
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
