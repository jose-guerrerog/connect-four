
// main.js
const config = {
  type: Phaser.AUTO,
  width: 700,
  height: 600,
  backgroundColor: 0x222222,
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

const rows = 6;
const columns = 7;
const cellSize = 100;

let board = [];
let position = [];
let graphics;
let currentPlayer = 'X';
let isPlayerTurn = true;
let gameOver = false;
let tokens = [];
let dropSound, winSound;

function preload() {
  this.load.audio('drop', 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
  this.load.audio('win', 'https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg');
}

function create() {
  graphics = this.add.graphics();
  drawBoard();
  initBoards();

  dropSound = this.sound.add('drop');
  winSound = this.sound.add('win');

  this.input.on('pointerdown', (pointer) => {
    if (gameOver || !isPlayerTurn) return;
    const col = Math.floor(pointer.x / cellSize);
    playerMove(col, this);
  });
}

function update() {}

function initBoards() {
  board = Array.from({ length: rows }, () => Array(columns).fill("-"));
  position = Array(columns).fill(rows - 1);
  tokens.forEach(t => t.destroy());
  tokens = [];
  currentPlayer = 'X';
  isPlayerTurn = true;
  gameOver = false;
  drawBoard();
}

function drawBoard() {
  graphics.clear();
  const offsetX = (config.width - columns * cellSize) / 2;
  const offsetY = (config.height - rows * cellSize) / 2;
  graphics.setPosition(offsetX, offsetY);
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, columns * cellSize, rows * cellSize);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(c * cellSize + 50, r * cellSize + 50, 42);
    }
  }
}

function playerMove(col, scene) {
  if (position[col] < 0) return;
  const row = position[col]--;
  placeToken(scene, row, col, 'X');
  board[row][col] = 'X';
  dropSound.play();

  const winner = checkForWinner(row, col);
  if (winner) {
    highlightWinner(scene, winner);
    winSound.play();
    endGame(scene, `You win!`);
    return;
  }

  if (emptySquares().length === 0) {
    endGame(scene, "It's a draw!");
    return;
  }

  isPlayerTurn = false;
  setTimeout(() => cpuMove(scene), 500);
}

function cpuMove(scene) {
  const move = minimax('computer', 0, -1, -1);
  const r = Math.floor(move.index / columns);
  const c = move.index % columns;

  if (position[c] < 0) return;
  const row = position[c]--;
  placeToken(scene, row, c, 'O');
  board[row][c] = 'O';
  dropSound.play();

  const winner = checkForWinner(row, c);
  if (winner) {
    highlightWinner(scene, winner);
    winSound.play();
    endGame(scene, `CPU wins!`);
    return;
  }

  if (emptySquares().length === 0) {
    endGame(scene, "It's a draw!");
    return;
  }

  isPlayerTurn = true;
}

function placeToken(scene, row, col, player) {
  const offsetX = (config.width - columns * cellSize) / 2;
  const offsetY = (config.height - rows * cellSize) / 2;
  const color = player === 'X' ? 0xffff00 : 0xff0000;
  const token = scene.add.graphics();
  token.fillStyle(color, 1);
  token.fillCircle(0, 0, 48);
  token.x = offsetX + col * cellSize + 50;
  token.y = offsetY - 50;
  tokens.push(token);
  scene.tweens.add({
    targets: token,
    props: {
      y: { value: offsetY + row * cellSize + 50, duration: 300, ease: 'Bounce.easeOut' }
    },
    duration: 300,
    ease: 'Bounce.easeOut'
  });
}

function highlightWinner(scene, { point1, point2, point3, point4 }) {
  const offsetX = (config.width - columns * cellSize) / 2;
  const offsetY = (config.height - rows * cellSize) / 2;
  const highlight = [point1, point2, point3, point4];
  highlight.forEach(p => {
    const x = offsetX + p.y * cellSize + 50;
    const y = offsetY + p.x * cellSize + 50;

    const glow = scene.add.graphics();
    glow.lineStyle(6, 0x00ff00, 1);
    glow.strokeCircle(0, 0, 48);
    glow.x = x;
    glow.y = y;
    tokens.push(glow);

    scene.tweens.add({
      targets: glow,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  });
}

function endGame(scene, message) {
  gameOver = true;
  const text = scene.add.text(100, 610, `${message} Tap to restart`, { fontSize: '24px', fill: '#fff' });
  scene.input.once('pointerdown', () => {
    text.destroy();
    initBoards();
  });
}

function checkForWinner(ii, ij) {
  const B = board;
  function getLine(dirX, dirY) {
    let line = [];
    for (let i = -3; i <= 3; i++) {
      const x = ii + i * dirX;
      const y = ij + i * dirY;
      if (x >= 0 && x < rows && y >= 0 && y < columns) {
        line.push({ x, y, val: B[x][y] });
      }
    }
    return line;
  }

  const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
  ];

  for (const { dx, dy } of directions) {
    const line = getLine(dx, dy);
    for (let i = 0; i <= line.length - 4; i++) {
      const chunk = line.slice(i, i + 4);
      if (chunk.every(cell => cell.val === board[ii][ij] && cell.val !== '-')) {
        return {
          point1: chunk[0],
          point2: chunk[1],
          point3: chunk[2],
          point4: chunk[3],
        };
      }
    }
  }
  return null;
}

function emptySquares() {
  let arr = [];
  for (let j = 0; j < columns; j++) {
    if (position[j] >= 0) {
      arr.push(position[j] * columns + j);
    }
  }
  return arr;
}

function minimax(player, depth, ii, ij) {
  let spots = emptySquares();
  let maxval = -1000;
  let minval = 1000;
  let move = { index: "", score: "" };

  if (ii !== -1 && ij !== -1) {
    const result = checkForWinner(ii, ij);
    if (result) {
      return {
        score: board[ii][ij] === 'O' ? 10 - depth : depth - 10
      };
    }
  }

  if (spots.length === 0 || depth === 5) {
    return { score: 0 };
  }

  for (let i = 0; i < spots.length; i++) {
    let indexj = spots[i] % columns;
    let indexi = Math.floor(spots[i] / columns);

    if (player === "computer") {
      board[indexi][indexj] = 'O';
      position[indexj]--;
      let result = minimax("human", depth + 1, indexi, indexj);
      if (result.score > maxval) {
        maxval = result.score;
        move = { score: maxval, index: spots[i] };
      }
    } else {
      board[indexi][indexj] = 'X';
      position[indexj]--;
      let result = minimax("computer", depth + 1, indexi, indexj);
      if (result.score < minval) {
        minval = result.score;
        move = { score: minval, index: spots[i] };
      }
    }
    position[indexj]++;
    board[indexi][indexj] = "-";
  }
  return move;
}