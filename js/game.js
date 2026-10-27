import { verbsBank, typeConfigs } from "./data/verbs.js";
import { getCurrentUser } from "./auth.js";
import { fireConfetti } from "./effects.js";
import { saveScore } from "./leaderboard.js";
import { showScreen } from "./ui.js";

let mode = "";
let typeLevel = "level1";
let timer = null;
let timeLeft = 0;

let stats = { total: 0, correct: 0, score: 0, consecutive: 0 };
let currentQuestion = { prompt: "", ans: "", type: "" };
const container = document.getElementById("app-container");

export function confirmExit() {
  if (
    confirm("Are you sure you want to exit the world?\n⚠️ Progress will be lost!")
  ) {
    clearInterval(timer);
    showScreen("menu-screen");
  }
}

export function startGame(selectedMode) {
  if (selectedMode === "timed" && !getCurrentUser()) {
    alert("🍄 You must Sign in with Google to play Timed Coin Dash!");
    return;
  }

  mode = selectedMode;
  stats = { total: 0, correct: 0, score: 0, consecutive: 0 };
  typeLevel = document.getElementById("question-type").value;

  document.getElementById("score-display").style.display =
    mode === "timed" ? "inline" : "none";
  document.getElementById("level-display").innerText =
    `${typeConfigs[typeLevel].name}`;

  updateStatsUI();

  if (mode === "infinite") {
    document.getElementById("time-display").innerText = "♾️ FREE PLAY";
    clearInterval(timer);
  } else {
    timeLeft = 180; // 3 minutes
    updateTimeUI();
    clearInterval(timer);
    timer = setInterval(timerTick, 1000);
  }

  showScreen("game-screen");
  generateQuestion();
}

function timerTick() {
  timeLeft--;
  updateTimeUI();
  if (timeLeft <= 0) {
    clearInterval(timer);
    endGame();
  }
}

function updateTimeUI() {
  let m = Math.floor(timeLeft / 60);
  let s = timeLeft % 60;
  document.getElementById("time-display").innerText =
    `TIME: ${m}:${s.toString().padStart(2, "0")}`;
  if (timeLeft <= 10 && mode !== "infinite") {
    document.getElementById("time-display").style.color = "var(--mario-red)";
  } else {
    document.getElementById("time-display").style.color = "#000";
  }
}

function generateRealisticDistractors(verb, askType, correctAnswer) {
  let options = new Set();
  let inf = verb.inf;
  let past = verb.past;
  let pp = verb.pp;

  if (askType === "level1") {
    if (inf.endsWith("e")) options.add(inf + "ing");
    options.add(inf + inf.slice(-1) + "ing");
    options.add(inf.slice(0, -1) + "ing");
    options.add(past + "ing");
  } else if (askType === "level2") {
    options.add(inf + "ed");
    if (inf.endsWith("e")) options.add(inf + "d");
    options.add(past + "ed");
    if (past !== pp) options.add(pp);
    options.add(inf.slice(0, -1) + "ed");
  } else if (askType === "level3") {
    options.add(inf + "ed");
    if (past !== pp) options.add(past);
    options.add(past + "en");
    options.add(inf + "en");
    options.add(pp + "ed");
  }

  let validDistractors = Array.from(options).filter(
    (opt) => opt !== correctAnswer && opt !== inf,
  );

  if (validDistractors.length < 3) {
    if (askType === "level1") {
      validDistractors.push(inf + "eing");
      validDistractors.push(pp + "ing");
    } else {
      validDistractors.push(verb.presCont);
    }
  }

  validDistractors.sort(() => Math.random() - 0.5);
  return validDistractors.slice(0, 3);
}

function generateQuestion() {
  const verb = verbsBank[Math.floor(Math.random() * verbsBank.length)];

  let askType = typeLevel;
  if (typeLevel === "challenge") {
    const types = ["level1", "level2", "level3"];
    askType = types[Math.floor(Math.random() * types.length)];
  }

  let label = "";
  let answer = "";

  if (askType === "level1") {
    label = "Present Continuous (+ing)";
    answer = verb.presCont;
  } else if (askType === "level2") {
    label = "Past Tense (V2)";
    answer = verb.past;
  } else if (askType === "level3") {
    label = "Past Participle (V3)";
    answer = verb.pp;
  }

  currentQuestion = { prompt: verb.inf, ans: answer, type: label };

  document.getElementById("target-tense").innerText = label;
  document.getElementById("question-text").innerText = verb.inf;

  let options = [answer];
  let mistakes = generateRealisticDistractors(verb, askType, answer);
  options.push(...mistakes);

  options.sort(() => Math.random() - 0.5);

  const choicesContainer = document.getElementById("choices-container");
  choicesContainer.innerHTML = "";

  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(opt);
    choicesContainer.appendChild(btn);
  });
}

function checkAnswer(selectedAns) {
  const isCorrect = selectedAns === currentQuestion.ans;

  stats.total++;
  if (isCorrect) {
    stats.correct++;
    stats.consecutive++;

    if (mode === "timed") {
      stats.score += typeConfigs[typeLevel].pts;
    }

    triggerFeedback("correct");
  } else {
    stats.consecutive = 0;
    if (mode === "timed") stats.score = Math.max(0, stats.score - 5);
    triggerFeedback("wrong");
    alert(
      `MAMAMIA! Incorrect! The correct form for "${currentQuestion.prompt}" is "${currentQuestion.ans}".`,
    );
  }

  updateStatsUI();
  generateQuestion();
}

function triggerFeedback(type) {
  container.classList.remove("feedback-correct", "feedback-wrong");
  void container.offsetWidth;
  container.classList.add(`feedback-${type}`);
  setTimeout(() => {
    container.classList.remove(`feedback-${type}`);
  }, 300);
}

function updateStatsUI() {
  const acc =
    stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
  document.getElementById("progress-display").innerText =
    `✔ ${stats.correct}/${stats.total} (${acc}%)`;
  document.getElementById("score-display").innerText =
    `🪙 COINS: ${stats.score}`;
}

function endGame() {
  showScreen("result-screen");
  const acc =
    stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
  const currentUser = getCurrentUser();

  let resultHTML = `
            Total Questions: <b style="color:var(--mario-blue)">${stats.total}</b><br>
            Correct Answers: <b style="color:var(--mario-green)">${stats.correct}</b><br>
            Accuracy: <b>${acc}%</b><br>
        `;

  if (mode === "timed" && currentUser) {
    resultHTML += `<hr style="border:0; border-top:2px dashed #000; margin:15px 0;"><span style="color:var(--mario-brick); font-size: 26px; font-weight:900;">COINS COLLECTED: 🪙 ${stats.score}</span>`;

    document.getElementById("upload-section").style.display = "block";
    document.getElementById("upload-name-display").innerText =
      currentUser.lastName;
    document.getElementById("submit-score-btn").disabled = false;
    document.getElementById("submit-score-btn").innerText = "🚀 Upload Score";
    fireConfetti();
  } else {
    document.getElementById("upload-section").style.display = "none";
  }

  document.getElementById("final-stats").innerHTML = resultHTML;
}

export function submitScore() {
  const stuClass = document.getElementById("class-select").value;
  const stuNum = document.getElementById("student-num").value;
  const currentUser = getCurrentUser();

  if (!stuNum || stuNum < 1 || stuNum > 40) {
    alert("⚠️ Please enter a valid Class Number (1-40) !");
    return;
  }

  const acc =
    stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);

  const data = {
    class: stuClass,
    studentNum: parseInt(stuNum),
    lastName: currentUser.lastName,
    googleId: currentUser.id,
    score: stats.score,
    accuracy: acc,
    questionType: typeLevel,
  };

  saveScore(data);
}
