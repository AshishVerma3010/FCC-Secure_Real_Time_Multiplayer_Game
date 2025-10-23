class Collectible {
  constructor({ x, y, value, id, width, height }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;

    // ✅ FIXED: Add width and height with defaults
    // If server provides width/height, use them
    // Otherwise, default to 20 (matches the circle we draw)
    this.width = width || 20;
    this.height = height || 20;
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch (e) {}

export default Collectible;
