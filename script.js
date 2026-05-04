const TEST_EASTER_EGG = false;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const runFrames = [];

const imgBoth = new Image();
imgBoth.src = "images/ben-franklin-both.png";

const imgLeft = new Image();
imgLeft.src = "images/ben-franklin-left.png";

const imgRight = new Image();
imgRight.src = "images/ben-franklin-right.png";

// Order matters for animation feel
runFrames.push(imgBoth, imgLeft, imgBoth, imgRight);

const pennFacts = [
  "Franklin Field is the oldest two-tiered stadium in the country and is home to the first scoreboard, the first football radio broadcast, and the first football telecast.",
  "Philadelphia, Unbreakable, Invincible, and Transformers: Revenge of the Fallen were all filmed on Penn's campus.",
  "'Ben on the Bench' reads from one of Penn's own publications, The Pennsylvania Gazette.",
  "Presidents Franklin Pierce and Franklin Delano Roosevelt were named after Penn's founder, Benjamin Franklin.",
  "The ENIAC computer, the first large-scale, general-purpose electronic computer, was built at the University of Pennsylvania's Moore School of Electrical Engineering in 1946."
];

const bgImage = new Image();
bgImage.src = "images/locust_walk.png";
bgImage.onload = () => draw();

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const finalScoreEl = document.getElementById("finalScore");
const bookCountEl = document.getElementById("bookCount");
const coffeeCountEl = document.getElementById("coffeeCount");
const capCountEl = document.getElementById("capCount");
const cameraCountEl = document.getElementById("cameraCount");
const reflectionTextEl = document.getElementById("reflectionText");

const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const restartBtn = document.getElementById("restartBtn");
const startBtnOverlay = document.getElementById("startBtnOverlay");
const startOverlay = document.getElementById("startOverlay");
const startCard = document.getElementById("startCard");
const endCard = document.getElementById("endCard");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const endPopup = document.getElementById("endPopup");
const popupScore = document.getElementById("popupScore");
const popupFactSection = document.getElementById("popupFactSection");
const popupFactText = document.getElementById("popupFactText");
const popupReflectionText = document.getElementById("popupReflectionText");
const popupMemoryLink = document.getElementById("popupMemoryLink");
const closeEndPopupBtn = document.getElementById("closeEndPopupBtn");

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const GAME_DURATION = 60;
const PLAYER_SPEED = 6;

const SPRITE_SCALE = 2.5;
const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

let gameRunning = false;
let gameEnded = false;
let score = 0;
let timeLeft = GAME_DURATION;
let spawnTimer = 0;
let animationFrameId = null;
let timerInterval = null;
let frameIndex = 0;
let frameTimer = 0;
let lastTime = 0;
let missedItems = 0;

const frameInterval = 120;

const player = {
  x: GAME_WIDTH / 2 - (SPRITE_WIDTH * SPRITE_SCALE) / 2,
  y: GAME_HEIGHT - 120,
  width: SPRITE_WIDTH * SPRITE_SCALE,
  height: SPRITE_HEIGHT * SPRITE_SCALE,
  speed: PLAYER_SPEED,
  moveLeft: false,
  moveRight: false
};

imgBoth.onload = () => {
  const scale = 0.5;
  const aspect = imgBoth.width / imgBoth.height;

  player.height = imgBoth.height * scale;
  player.width = player.height * aspect;
  player.x = GAME_WIDTH / 2 - player.width / 2;

  draw();
};

const items = [];

const counts = {
  books: 0,
  coffee: 0,
  cap: 0,
  ticket: 0,
  building: 0,
  bus: 0,
  camera: 0,
  party: 0
};

const itemTypes = [
  {
    type: "books",
    label: "Long days at the library",
    emoji: "📚",
    color: "#2563eb"
  },
  {
    type: "cap",
    label: "Graduation day",
    emoji: "🎓",
    color: "#7c3aed"
  },
  {
    type: "coffee",
    label: "Late night coffee run",
    emoji: "☕",
    color: "#b45309"
  },
  {
    type: "ticket",
    label: "Campus events",
    emoji: "🎟️",
    color: "#dc2626"
  },
  {
    type: "building",
    label: "Walking to class on Locust Walk",
    emoji: "🏫",
    color: "#059669"
  },
  {
    type: "bus",
    label: "Taking the Penn Bus",
    emoji: "🚌",
    color: "#ea580c"
  },
  {
    type: "camera",
    label: "Capturing memories with friends",
    emoji: "📸",
    color: "#0f766e"
  },
  {
    type: "party",
    label: "Celebrations and social moments",
    emoji: "🎉",
    color: "#db2777"
  }
];

function showEndPopup(showFact, factMessage = "") {
  if (!endPopup) return;

  if (popupScore) {
    popupScore.textContent = String(score);
  }

  if (popupReflectionText) {
    popupReflectionText.textContent = reflectionTextEl.textContent;
  }

  if (popupFactSection && popupFactText) {
    if (showFact) {
      popupFactText.innerHTML = factMessage;
      popupFactSection.classList.remove("hidden");
    } else {
      popupFactText.innerHTML = "";
      popupFactSection.classList.add("hidden");
    }
  }

  endPopup.classList.remove("hidden-popup");
  endPopup.style.display = "flex";

  endPopup.classList.remove("is-entering");
  void endPopup.offsetWidth;
  endPopup.classList.add("is-entering");

  setTimeout(() => {
    if (popupMemoryLink) {
      popupMemoryLink.focus();
    }
  }, 60);
}

function hideEndPopup() {
  if (!endPopup) return;

  endPopup.style.display = "none";
  endPopup.classList.add("hidden-popup");
  endPopup.classList.remove("is-entering");
}

function resetGame() {
  gameRunning = false;
  gameEnded = false;

  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrameId);

  score = 0;
  timeLeft = GAME_DURATION;
  spawnTimer = 0;
  items.length = 0;
  missedItems = 0;

  counts.books = 0;
  counts.coffee = 0;
  counts.cap = 0;
  counts.ticket = 0;
  counts.building = 0;
  counts.bus = 0;
  counts.camera = 0;
  counts.party = 0;

  player.x = GAME_WIDTH / 2 - player.width / 2;
  player.y = GAME_HEIGHT - 120;
  player.moveLeft = false;
  player.moveRight = false;

  frameIndex = 0;
  frameTimer = 0;
  lastTime = 0;

  scoreEl.textContent = "0";
  timeEl.textContent = String(GAME_DURATION);
  finalScoreEl.textContent = "0";
  bookCountEl.textContent = "0";
  coffeeCountEl.textContent = "0";
  capCountEl.textContent = "0";
  cameraCountEl.textContent = "0";
  reflectionTextEl.textContent = "";

  if (popupReflectionText) {
    popupReflectionText.textContent = "";
  }

  hideEndPopup();

  if (startOverlay) {
    startOverlay.classList.remove("hidden");
  }

  if (startCard) {
    startCard.classList.add("hidden");
  }

  if (endCard) {
    endCard.classList.remove("hidden");
  }

  draw();
}

function continueAfterResults() {
  gameRunning = false;
  gameEnded = false;

  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrameId);

  items.length = 0;

  player.x = GAME_WIDTH / 2 - player.width / 2;
  player.y = GAME_HEIGHT - 120;
  player.moveLeft = false;
  player.moveRight = false;

  frameIndex = 0;
  frameTimer = 0;
  lastTime = 0;

  hideEndPopup();

  if (startOverlay) {
    startOverlay.classList.remove("hidden");
  }

  if (startCard) {
    startCard.classList.add("hidden");
  }

  if (endCard) {
    endCard.classList.remove("hidden");
  }

  draw();
}

function startGame() {
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrameId);

  score = 0;
  timeLeft = GAME_DURATION;
  spawnTimer = 0;
  items.length = 0;
  missedItems = 0;
  gameRunning = true;
  gameEnded = false;

  counts.books = 0;
  counts.coffee = 0;
  counts.cap = 0;
  counts.ticket = 0;
  counts.building = 0;
  counts.bus = 0;
  counts.camera = 0;
  counts.party = 0;

  player.x = GAME_WIDTH / 2 - player.width / 2;
  player.y = GAME_HEIGHT - 120;
  player.moveLeft = false;
  player.moveRight = false;

  frameIndex = 0;
  frameTimer = 0;
  lastTime = 0;

  scoreEl.textContent = "0";
  timeEl.textContent = String(GAME_DURATION);
  finalScoreEl.textContent = "0";
  bookCountEl.textContent = "0";
  coffeeCountEl.textContent = "0";
  capCountEl.textContent = "0";
  cameraCountEl.textContent = "0";
  reflectionTextEl.textContent = "";

  if (popupReflectionText) {
    popupReflectionText.textContent = "";
  }

  hideEndPopup();

  if (startOverlay) {
    startOverlay.classList.add("hidden");
  }

  if (startCard) {
    startCard.classList.remove("hidden");
  }

  if (endCard) {
    endCard.classList.add("hidden");
  }

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  gameLoop();
}

function endGame() {
  gameRunning = false;
  gameEnded = true;

  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrameId);

  player.x = (GAME_WIDTH - player.width) / 2;
  player.y = GAME_HEIGHT - player.height - 20;

  items.length = 0;
  draw();

  finalScoreEl.textContent = String(score);

  bookCountEl.textContent = String(counts.books + counts.coffee);
  coffeeCountEl.textContent = String(counts.cap + counts.ticket);
  capCountEl.textContent = String(counts.building + counts.bus);
  cameraCountEl.textContent = String(counts.camera + counts.party);

  const runReflection = generateReflectionText();
  reflectionTextEl.textContent = runReflection;

  const collectedEverything = TEST_EASTER_EGG || (missedItems === 0 && score > 0);

  if (collectedEverything) {
    const randomFact = pennFacts[Math.floor(Math.random() * pennFacts.length)];

    showEndPopup(
      true,
      "<em>You collected every single memory.</em><br><br><strong>You unlocked a Penn fact:</strong> " + randomFact
    );
  } else {
    showEndPopup(false);
  }

  if (startCard) {
    startCard.classList.add("hidden");
  }

  if (endCard) {
    endCard.classList.remove("hidden");
  }
}

function updateAnimation(deltaTime) {
  frameTimer += deltaTime;

  if (frameTimer > frameInterval) {
    frameTimer = 0;
    frameIndex = (frameIndex + 1) % runFrames.length;
  }
}

function generateReflectionText() {
  const groupedCounts = {
    academic: counts.books + counts.coffee,
    milestones: counts.cap + counts.ticket,
    campus: counts.building + counts.bus,
    social: counts.camera + counts.party
  };

  const entries = Object.entries(groupedCounts).sort((a, b) => b[1] - a[1]);

  if (entries[0][1] === 0) {
    return "Try another round and see what memories you collect.";
  }

  const topType = entries[0][0];

  if (topType === "academic") {
    return "Your run leaned toward study life, library time, and late-night coffee memories.";
  }

  if (topType === "milestones") {
    return "Your run highlighted major moments, celebrations, and campus events.";
  }

  if (topType === "campus") {
    return "Your run centered on everyday campus life, walks on Locust Walk, and Penn Bus rides.";
  }

  return "Your run captured social moments, friendships, and celebrations from campus life.";
}

function spawnItem() {
  const choice = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  const size = 34 + Math.random() * 10;

  const progress = (GAME_DURATION - timeLeft) / GAME_DURATION;
  const minSpeed = 0.8;
  const maxSpeed = 2;
  const speed = minSpeed + (maxSpeed - minSpeed) * progress;

  items.push({
    baseX: (Math.random() - 0.5) * 8,
    spreadFactor: 6 + Math.random() * 24,
    x: GAME_WIDTH / 2,
    y: 200,
    width: size,
    height: size,
    size: size,
    speed: speed,
    type: choice.type,
    label: choice.label,
    color: choice.color,
    emoji: choice.emoji
  });
}

function update() {
  if (player.moveLeft) {
    player.x -= player.speed;
  }

  if (player.moveRight) {
    player.x += player.speed;
  }

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > GAME_WIDTH) {
    player.x = GAME_WIDTH - player.width;
  }

  const progress = (GAME_DURATION - timeLeft) / GAME_DURATION;

  const maxDelay = 55;
  const minDelay = 20;
  const spawnDelay = maxDelay - (maxDelay - minDelay) * progress;

  spawnTimer += 1;

  if (spawnTimer > spawnDelay) {
    spawnItem();
    spawnTimer = 0;
  }

  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];

    item.y += item.speed;

    const t = Math.min(1, (item.y - 90) / (GAME_HEIGHT - 140));

    const laneHalfWidthTop = 10;
    const laneHalfWidthBottom = 220;
    const laneHalfWidth = laneHalfWidthTop + (laneHalfWidthBottom - laneHalfWidthTop) * t;

    const centerX = GAME_WIDTH / 2;

    item.x = centerX + item.baseX * (1 + Math.pow(t, 1.8) * item.spreadFactor * 3);

    const minSize = 12;
    const maxSize = 42;

    item.size = minSize + (maxSize - minSize) * t;
    item.width = item.size;
    item.height = item.size;

    if (item.x < centerX - laneHalfWidth) {
      item.x = centerX - laneHalfWidth;
    }

    if (item.x + item.width > centerX + laneHalfWidth) {
      item.x = centerX + laneHalfWidth - item.width;
    }

    if (isColliding(player, item)) {
      counts[item.type] += 1;
      score += 1;
      scoreEl.textContent = String(score);
      items.splice(i, 1);
      continue;
    }

    if (item.y > GAME_HEIGHT + 30) {
      missedItems += 1;
      items.splice(i, 1);
    }
  }
}

function drawBackground() {
  if (bgImage.complete && bgImage.naturalWidth > 0) {
    ctx.drawImage(bgImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);
  } else {
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
}

function drawPlayer() {
  const sprite = runFrames[frameIndex];

  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
  }
}

function drawItems() {
  items.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(item.x, item.y, item.width, item.height);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.strokeRect(item.x, item.y, item.width, item.height);

    ctx.font = `${Math.floor(item.width * 0.72)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(item.emoji, item.x + item.width / 2, item.y + item.height / 2 + 2);
  });
}

function drawOverlayText() {
  if (!gameRunning && !gameEnded && !startOverlay?.classList.contains("hidden")) {
    return;
  }

  if (!gameRunning && !gameEnded) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 28px Arial";
    ctx.fillText("Memory Collector", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

    ctx.font = "18px Arial";
    ctx.fillText("Press Start to begin", GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }
}

function draw() {
  drawBackground();
  drawPlayer();
  drawItems();
  drawOverlayText();
}

function gameLoop(timestamp = 0) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  updateAnimation(deltaTime);
  update();
  draw();

  if (gameRunning) {
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function setMoveLeft(isMoving) {
  player.moveLeft = isMoving;
}

function setMoveRight(isMoving) {
  player.moveRight = isMoving;
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    setMoveLeft(true);
  }

  if (event.key === "ArrowRight") {
    setMoveRight(true);
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") {
    setMoveLeft(false);
  }

  if (event.key === "ArrowRight") {
    setMoveRight(false);
  }
});

["mousedown", "touchstart"].forEach((eventName) => {
  leftBtn.addEventListener(eventName, (event) => {
    event.preventDefault();
    setMoveLeft(true);
  });

  rightBtn.addEventListener(eventName, (event) => {
    event.preventDefault();
    setMoveRight(true);
  });
});

["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((eventName) => {
  leftBtn.addEventListener(eventName, () => setMoveLeft(false));
  rightBtn.addEventListener(eventName, () => setMoveRight(false));
});

if (endPopup) {
  endPopup.addEventListener("animationend", () => {
    endPopup.classList.remove("is-entering");
  });
}

if (closeEndPopupBtn) {
  closeEndPopupBtn.addEventListener("click", () => {
    continueAfterResults();

    if (startBtnOverlay) {
      startBtnOverlay.focus();
    }
  });
}

if (startBtn) {
  startBtn.addEventListener("click", startGame);
}

if (startBtnOverlay) {
  startBtnOverlay.addEventListener("click", startGame);
}

if (restartBtn) {
  restartBtn.addEventListener("click", resetGame);
}

if (playAgainBtn) {
  playAgainBtn.addEventListener("click", () => {
    hideEndPopup();
    resetGame();
  });
}

draw();
