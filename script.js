let score1 = 0;
let score2 = 0;

document.getElementById("refreshbtn").addEventListener("click", () => {
  location.reload();
});

function updateScore() {
  document.getElementById("score1").innerHTML = score1;
  document.getElementById("score2").innerHTML = score2;
}

document.getElementById("plusT1").addEventListener("click", () => {
  score1++;
  updateScore();
});

document.getElementById("plusT2").addEventListener("click", () => {
  score2++;
  updateScore();
});

document.getElementById("minusT1").addEventListener("click", () => {
  score1 = Math.max(0, score1 - 1);
  updateScore();
});

document.getElementById("minusT2").addEventListener("click", () => {
  score2 = Math.max(0, score2 - 1);
  updateScore();
});
