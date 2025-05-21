function GameManager(size, InputManager, Actuator, ScoreManager) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.scoreManager = new ScoreManager;
  this.actuator     = new Actuator;

  this.startTiles   = 1;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.continue();
  this.setup();
};

// Keep playing after winning
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continue();
};

GameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid        = new Grid(this.size);

  this.score       = 0;
  this.over        = false;
  this.won         = false;
  this.keepPlaying = false;

  // Add the initial tiles
  this.addStartTiles();

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.99999999 ? Math.random() < 0.99999998 ? Math.random() < 0.99999996 ? Math.random() < 0.9999999545454545454545454 ? Math.random() < 0.99999995 ? Math.random() < 0.9999999375 ? Math.random() < 0.9999999 ? Math.random() < 0.9999998 ? Math.random() < 0.999999 ? Math.random() < 0.999998 ? Math.random() < 0.999996 ? Math.random() < 0.999992 ? Math.random() < 0.99999 ? Math.random() < 0.9999894736842105263157 ? Math.random() < 0.9999875 ? Math.random() < 0.9999857142857142857142 ? Math.random() < 0.999984 ? Math.random() < 0.99998 ? Math.random() < 0.999975 ? Math.random() < 0.99997 ? Math.random() < 0.9999666666666666666666 ? Math.random() < 0.999958333333333333333333 ? Math.random() < 0.9999473684210526315789 ? Math.random() < 0.9999285714285714285714 ? Math.random() < 0.9999 ? Math.random() < 0.999875 ? Math.random() < 0.9998 ? Math.random() < 0.9995 ? Math.random() < 0.99875 ? 1 : Math.random() < 0.999 ? 2 : -2 : Math.random() < 0.999 ? 3 : -3 : Math.random() < 0.999 ? 4 : -4 : Math.random() < 0.999 ? 5 : -5 : Math.random() < 0.999 ? 6 : -6 : Math.random() < 0.999 ? 7 : -7 : Math.random() < 0.999 ? 8 : -8 : Math.random() < 0.999 ? 9 : -9 : Math.random() < 0.999 ? 10 : -10 : Math.random() < 0.999 ? 11 : -11 : Math.random() < 0.999 ? 12 : -12 : Math.random() < 0.999 ? 13 : -13 : Math.random() < 0.999 ? 14 : -14 : Math.random() < 0.999 ? 15 : -15 : Math.random() < 0.999 ? 16 : -16 : Math.random() < 0.999 ? 17 : -17 : Math.random() < 0.999 ? 18 : -18 : Math.random() < 0.999 ? 19 : -19 : Math.random() < 0.999 ? 20 : -20 : Math.random() < 0.999 ? 21 : -21 : Math.random() < 0.999 ? 22 : -22 : Math.random() < 0.999 ? 23 : -23 : Math.random() < 0.999 ? 24 : -24 : Math.random() < 0.999 ? 31 : -31 : Math.random() < 0.999 ? 0 : 30 : Math.random() < 0.999 ? 32 : -32 : Math.random() < 0.999 ? 82 : -82 : Math.random() < 0.999 ? 25 : -25 : Math.random() < 0.999 ? 26 : -26; 
    var tile = new Tile(this.grid.randomAvailableCell(), value);
    
    this.grid.insertTile(tile);
    this.score += 1;
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.scoreManager.get() < this.score) {
    this.scoreManager.set(this.score);
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.scoreManager.get(),
    terminated: this.isGameTerminated()
  });

};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) { 
          var merged = new Tile(positions.next, tile.value * 1);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);
          
          // The mighty 22 tile
          if (merged.value === 22) self.won = true;
          if (merged.value === 32) self.over = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};


