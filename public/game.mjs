import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";

const socket = io();
const canvas = document.getElementById("game-window");
const ctx = canvas.getContext("2d");

let player = null;
let gameState = {
  players: [],
  collectible: null,
};

// Initialize player when connected
socket.on("init", (message) => {
  console.log("✅ Connected:", message);

  player = new Player({
    x: Math.floor(Math.random() * 600 + 20),
    y: Math.floor(Math.random() * 440 + 20),
    score: 0,
    id: socket.id,
  });

  console.log("✅ Player created:", player);
  socket.emit("updatePlayer", { playerObj: player });
});

// Update game state from server
socket.on("updatedGameState", (newGameState) => {
  gameState = newGameState;

  // ✅ IMPROVED: Better collision detection with debugging
  if (player && gameState.collectible) {
    const collectible = new Collectible(gameState.collectible);

    if (player.collision(collectible)) {
      console.log("🎯 COLLISION! Old score:", player.score);
      player.score += collectible.value;
      console.log("🎯 New score:", player.score);

      // Request new collectible from server
      socket.emit("refresh-collectible", true);

      // Update player with new score
      socket.emit("updatePlayer", { playerObj: player });
    }
  }
});

// Keyboard controls
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  e.preventDefault(); // Prevent page scrolling with arrow keys
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Game loop
function gameLoop() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (player) {
    // Handle movement
    const speed = 5;
    let moved = false;

    if (keys["w"] || keys["ArrowUp"]) {
      player.movePlayer("up", speed);
      moved = true;
    }
    if (keys["s"] || keys["ArrowDown"]) {
      player.movePlayer("down", speed);
      moved = true;
    }
    if (keys["a"] || keys["ArrowLeft"]) {
      player.movePlayer("left", speed);
      moved = true;
    }
    if (keys["d"] || keys["ArrowRight"]) {
      player.movePlayer("right", speed);
      moved = true;
    }

    if (moved) {
      socket.emit("updatePlayer", { playerObj: player });
    }

    // Draw all players
    gameState.players.forEach((p) => {
      const playerObj = p.playerObj;

      if (playerObj.id === player.id) {
        ctx.fillStyle = "#00ff00"; // Green for you

        // ✅ Add border for your player
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(playerObj.x, playerObj.y, 30, 30);
      } else {
        ctx.fillStyle = "#ff0000"; // Red for others
      }
      ctx.fillRect(playerObj.x, playerObj.y, 30, 30);

      // Draw player ID (shortened)
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px Arial";
      ctx.fillText(playerObj.id.substring(0, 5), playerObj.x, playerObj.y - 5);
    });

    // Draw collectible with better visibility
    if (gameState.collectible) {
      // ✅ Draw glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ffd700";

      ctx.fillStyle = "#ffd700"; // Gold
      ctx.beginPath();
      ctx.arc(
        gameState.collectible.x + 10,
        gameState.collectible.y + 10,
        10,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // ✅ Add collision box visualization (for debugging)
      // ctx.strokeStyle = '#00ffff';
      // ctx.lineWidth = 1;
      // ctx.strokeRect(gameState.collectible.x, gameState.collectible.y, 20, 20);
    }

    // Draw score and rank
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.fillText(`Score: ${player.score}`, 10, 30);

    if (gameState.players.length > 0) {
      const rank = player.calculateRank(
        gameState.players.map((p) => p.playerObj)
      );
      ctx.font = "bold 18px Arial";
      ctx.fillText(rank, 10, 60);
    }

    // Draw controls help
    ctx.font = "12px Arial";
    ctx.fillText("Controls: WASD or Arrow Keys", 10, canvas.height - 10);

    // ✅ Draw player position (for debugging boundaries)
    ctx.font = "10px Arial";
    ctx.fillText(
      `Pos: (${Math.floor(player.x)}, ${Math.floor(player.y)})`,
      10,
      90
    );
  } else {
    // Show connecting message
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText("Connecting to server...", 200, 240);
  }

  requestAnimationFrame(gameLoop);
}

// Start game loop
console.log("🎮 Starting game loop...");
gameLoop();
