class Player {
  constructor({ x, y, score, id }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.width = 30;
    this.height = 30;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case "up":
        this.y -= speed; // ✅ SUBTRACT to move UP (toward Y=0)
        break;
      case "down":
        this.y += speed; // ✅ ADD to move DOWN (toward Y=480)
        break;
      case "left":
        this.x -= speed; // ✅ Correct
        break;
      case "right":
        this.x += speed; // ✅ Correct
        break;
    }

    // ✅ FIXED: Keep player within canvas bounds (640x480)
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > 640) this.x = 640 - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > 480) this.y = 480 - this.height;
  }

  collision(item) {
    // ✅ FIXED: Proper collision detection with buffer
    const buffer = 5; // Allow slightly easier collision

    return (
      this.x < item.x + item.width + buffer &&
      this.x + this.width > item.x - buffer &&
      this.y < item.y + item.height + buffer &&
      this.y + this.height > item.y - buffer
    );
  }

  calculateRank(players) {
    const sortedPlayers = players.sort((a, b) => b.score - a.score);
    const myRank =
      sortedPlayers.findIndex((player) => player.id === this.id) + 1;
    return `Rank: ${myRank}/${players.length}`;
  }
}

export default Player;
