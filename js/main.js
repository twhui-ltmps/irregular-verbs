import { initGoogleLogin } from "./auth.js";
import { initBackgroundSymbols } from "./effects.js";
import { confirmExit, startGame, submitScore } from "./game.js";
import { fetchLeaderboard } from "./leaderboard.js";
import { showScreen } from "./ui.js";

initBackgroundSymbols();
initGoogleLogin();

document.querySelectorAll("[data-mode]").forEach((btn) => {
  btn.addEventListener("click", () => startGame(btn.dataset.mode));
});

document.querySelectorAll("[data-screen]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

document.getElementById("leaderboard-btn").addEventListener("click", () => {
  showScreen("leaderboard-screen");
  fetchLeaderboard();
});

document.getElementById("exit-btn").addEventListener("click", confirmExit);
document
  .getElementById("submit-score-btn")
  .addEventListener("click", submitScore);

document
  .getElementById("filter-mode")
  .addEventListener("change", fetchLeaderboard);
document
  .getElementById("filter-class")
  .addEventListener("change", fetchLeaderboard);
