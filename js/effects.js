const marioIcons = ["🍄", "⭐", "🪙", "🔥", "❓", "📦"];

export function initBackgroundSymbols() {
  const bgContainer = document.getElementById("bg-symbols");
  for (let i = 0; i < 15; i++) {
    let el = document.createElement("div");
    el.className = "symbol";
    el.innerText = marioIcons[Math.floor(Math.random() * marioIcons.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.animationDuration = Math.random() * 4 + 6 + "s";
    el.style.animationDelay = Math.random() * 4 + "s";
    bgContainer.appendChild(el);
  }
}

export function fireConfetti() {
  const container = document.getElementById("confetti-container");
  container.innerHTML = "";
  const colors = ["#e52521", "#fbd000", "#43b047", "#00247d", "#ffffff"];
  for (let i = 0; i < 60; i++) {
    let conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.top = "-10px";
    conf.style.transition =
      "transform 3s ease-in, top 3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 3s";

    const fallX = (Math.random() - 0.5) * 250;
    const fallY = window.innerHeight + 50;
    const rotate = Math.random() * 720;
    container.appendChild(conf);

    setTimeout(() => {
      conf.style.transform = `translateX(${fallX}px) rotate(${rotate}deg)`;
      conf.style.top = `${fallY}px`;
      conf.style.opacity = 0;
    }, 50);
  }
}
