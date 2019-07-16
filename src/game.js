export default class beep {
  constructor(ctx, seed) {
    this.ctx = ctx;
    this.seed = seed;
    this.aliveCells = [];
    this.cellWidth = 20;
    this.isStarted = false;
    this.grid = this.ctx.createGraphics(window.outerWidth, window.innerHeight);
    this.speed = 200;
    this.isFrozen = false; // this is used to freeze the game when opening a new game prompt
    this.start();
  }

  newGame(newSeed) {
    this.seed = this.rand(newSeed);
    this.start();
  }

  start() {
    this.aliveCells = [];
    this.readyCanvas();
    this.setRefreshInterval();
    for (let i = 0; i < 300; i++) {
      let randx = Math.round(this.rand(this.seed + 100 + i) * 30);
      let randy = Math.round(this.rand(this.seed + i) * 30);
      let x = this.getX((window.outerWidth - 600) / 2) + randx;
      let y = this.getY((window.innerHeight - 700) / 2) + randy;
      let cell = new Cell(x, y);
      this.aliveCells.push(cell);
    }

    // HARDCODED FOR TESTING
    // let cell = new Cell(40, 20);
    // let cell2 = new Cell(40, 21);
    // let cell3 = new Cell(40, 22);
    // this.aliveCells.push(cell, cell2, cell3);
    // HARDCODED FOR TESTING

    this.drawCells();
    this.isStarted = true;
  }

  update() {
    if (!this.isStarted && !this.isFrozen) return;
    let dead = [];
    let revived = [];

    // VV revive eligible ded cells
    this.aliveCells.forEach(aliveCell => {
      for (let x = aliveCell.x - 1; x < aliveCell.x + 2; x++) {
        for (let y = aliveCell.y - 1; y < aliveCell.y + 2; y++) {
          let cell = new Cell(x, y);
          if (this.getBoyzInDaHood(cell) == 3 && !this.isAlive(cell) && !this.isInList(cell, revived)) {
            revived.push(cell);
          }
        }
      }
    });

    // VV kill cells that have bad amount of neighbours
    for (let i = 0; i < this.aliveCells.length; i++) {
      let cell = this.aliveCells[i];
      let boyz = this.getBoyzInDaHood(cell);
      if (boyz > 3 || boyz < 2) {
        dead.push(i);
      }
    }

    // VV Update lists
    let timer = 0; // this was done for optimisation
    dead.forEach(index => {
      this.aliveCells.splice(index - timer, 1);
      timer++;
    });
    this.aliveCells = this.aliveCells.concat(revived);

    this.drawCells();
  }

  readyCanvas() {
    this.ctx.background(100);
    this.grid.stroke(200);

    // VV generate grid
    for (let i = 0; i < window.outerWidth; i += 20) {
      this.grid.line(i, 0, i, window.innerHeight);
    }
    for (let i = 0; i < window.innerHeight; i += 20) {
      this.grid.line(0, i, window.outerWidth, i);
    }
    this.ctx.image(this.grid, 0, 0)
    this.grid.clear();
  }

  drawCells() {
    this.aliveCells.forEach(cell => {
      let x = (cell.x - 1) * this.cellWidth;
      let y = (cell.y + 1) * this.cellWidth;
      this.ctx.fill(200);
      this.ctx.noStroke();
      this.ctx.rect(x, y, this.cellWidth, this.cellWidth);
    });
  };

  getBoyzInDaHood(cell) { // getNeighbours() :D
    let count = 0;
    for (let x = cell.x - 1; x < cell.x + 2; x++) {
      for (let y = cell.y - 1; y < cell.y + 2; y++) {
        this.aliveCells.forEach(elem => {
          if (cell.x != x || cell.y != y) {
            if (elem.x == x && elem.y == y) {
              count++;
            }
          }
        });
      }
    }
    return count;
  }

  setRefreshInterval(speed) {
    if (speed != undefined) this.speed = speed;
    clearInterval(this.runtimeInterval);
    this.runtimeInterval = setInterval(() => {
      if (this.isStarted && !this.isFrozen) {
        this.readyCanvas();
        this.update();
      }
    }, this.speed);
  }

  updateSpeed(newSpeed) {
    this.setRefreshInterval(1000 / newSpeed);
  }

  getX(coord) { // transfer pixels to grid row
    let filter = coord - (coord % this.cellWidth);
    return filter / this.cellWidth + 1;
  }

  getY(coord) { // transfer pixels to grid column
    let filter = coord - (coord % this.cellWidth);
    return filter / this.cellWidth + 1;
  }

  stop() { // oh my what could this possibly do??
    if (!this.isStarted) return; else this.isStarted = false;
    clearInterval(this.runtimeInterval);
  }

  continue() {
    if (this.isStarted) return; else this.isStarted = true;
    this.readyCanvas();
    this.update();
    this.runtimeInterval = setInterval(() => {
      if (this.isStarted || this.isFrozen) {
        this.readyCanvas();
        this.update();
      }
    }, this.speed);
  }

  togglePause() {
    if (this.isStarted) this.stop(); else this.continue();
  }

  restart() {
    this.stop();
    this.start();
  }

  isAlive(cell) { // just a lil bit easier to use than the bottom one
    let isAlive = false;
    this.aliveCells.forEach(arrayCell => {
      if (arrayCell.x == cell.x && arrayCell.y == cell.y) {
        isAlive = true;
      }
    });
    return isAlive;
  }

  isInList(cell, arr) {
    let contains = false;
    arr.forEach(arrayCell => {
      if (arrayCell.x == cell.x && arrayCell.y == cell.y) {
        contains = true;
      }
    });
    return contains;
  }

  rand(seed) {
    var x = Math.sin(seed) * 1000000;
    return x - Math.floor(x);
  }
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  coords() {
    return [this.x, this.y];
  }
}