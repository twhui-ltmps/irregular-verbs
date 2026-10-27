import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { showScreen } from "./ui.js";

export async function saveScore(data) {
  const btn = document.getElementById("submit-score-btn");
  try {
    btn.innerText = "Uploading...";
    btn.disabled = true;

    const modeSuffix = `timed_${data.questionType}`;
    const docId = `${data.googleId}_${modeSuffix}`;

    const docRef = doc(db, "leaderboard", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const oldData = docSnap.data();
      if (data.score <= oldData.score) {
        alert(
          `Your high score in this world is ${oldData.score} Coins. Keep trying! 💪`,
        );
        btn.innerText = "🚀 Upload Score";
        btn.disabled = false;

        document.getElementById("filter-mode").value = modeSuffix;
        showScreen("leaderboard-screen");
        fetchLeaderboard();
        return;
      }
    }

    await setDoc(docRef, {
      class: data.class,
      studentNum: data.studentNum,
      lastName: data.lastName,
      score: data.score,
      accuracy: data.accuracy,
      gameMode: "timed",
      questionType: data.questionType,
      timestamp: new Date(),
    });

    alert("COURSE CLEAR! New record saved! 🎉");
    document.getElementById("filter-mode").value = modeSuffix;
    showScreen("leaderboard-screen");
    fetchLeaderboard();
  } catch (e) {
    console.error("Error saving document: ", e);
    alert("Upload failed. Please check your connection.");
  } finally {
    btn.innerText = "🚀 Upload Score";
    btn.disabled = false;
  }
}

export async function fetchLeaderboard() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "<tr><td colspan='6'>Loading... ⏳</td></tr>";

  const modeFilter = document.getElementById("filter-mode").value;
  const classFilter = document.getElementById("filter-class").value;

  let qType = modeFilter.split("_")[1];

  let queryConditions = [
    where("gameMode", "==", "timed"),
    where("questionType", "==", qType),
  ];

  if (classFilter !== "ALL") {
    queryConditions.push(where("class", "==", classFilter));
  }

  try {
    const q = query(
      collection(db, "leaderboard"),
      ...queryConditions,
      orderBy("score", "desc"),
      limit(30),
    );
    const querySnapshot = await getDocs(q);

    tbody.innerHTML = "";
    let rank = 1;

    if (querySnapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='6'>No high scores yet!</td></tr>";
      return;
    }

    querySnapshot.forEach((snap) => {
      const data = snap.data();
      let rankDisplay =
        rank === 1
          ? "🥇 1"
          : rank === 2
            ? "🥈 2"
            : rank === 3
              ? "🥉 3"
              : rank;

      tbody.innerHTML += `
                <tr>
                    <td style="font-weight:bold; color: ${rank <= 3 ? "var(--mario-red)" : "inherit"};">${rankDisplay}</td>
                    <td>${data.class}</td>
                    <td>${data.studentNum}</td>
                    <td style="color: var(--mario-blue); font-weight: bold;">${data.lastName || "Mario"}</td>
                    <td style="font-weight:bold; color:var(--mario-brick); font-size:18px;">🪙 ${data.score}</td>
                    <td>${data.accuracy}%</td>
                </tr>
            `;
      rank++;
    });
  } catch (e) {
    console.error("Error fetching docs: ", e);
    tbody.innerHTML = `<tr><td colspan='6' style="color:red; font-size:13px;">
            Failed to load data. Firebase index may be missing.
        </td></tr>`;
  }
}
