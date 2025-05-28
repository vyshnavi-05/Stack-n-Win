const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = '';
let gameOver = false;
let gameMode = '2player'; // '2player' or 'pvc' (player vs computer)
let lastMoveRow = null;
let lastMoveCol = null;

const boardEl = document.getElementById('board');
const currentPlayerEl = document.getElementById('current-player');
const startBtn = document.getElementById('start-btn');

function createBoard() {
  boardEl.innerHTML = '';
  board = [];

  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      boardEl.appendChild(cell);
      row.push(cell);
    }
    board.push(row);
  }

  boardEl.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleClick);
  });
}

function handleClick(e) {
  if (gameOver) return;

  // In PVC mode, ignore clicks if it's computer's turn
  if (gameMode === 'pvc' && currentPlayer === 'navy') return;

  const col = +e.target.dataset.col;

  if (makeMove(col, currentPlayer)) {
    if (checkWin(lastMoveRow, lastMoveCol)) {
      gameOver = true;
      launchConfetti(currentPlayer);
      currentPlayerEl.textContent = `${currentPlayer.toUpperCase()} WINS!`;
      return;
    }

    currentPlayer = currentPlayer === 'red' ? 'navy' : 'red';
    updateTurnDisplay();

    if (gameMode === 'pvc' && currentPlayer === 'navy') {
      setTimeout(aiMove, 600);
    }
  }
}

// Drops piece in column for player. Returns true if move successful
function makeMove(col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    const cell = board[r][col];
    if (!cell.classList.contains('red') && !cell.classList.contains('navy')) {
      cell.classList.add(player);
      lastMoveRow = r;
      lastMoveCol = col;
      return true;
    }
  }
  return false; // Column full
}

function updateTurnDisplay() {
  currentPlayerEl.textContent = currentPlayer.toUpperCase();
  currentPlayerEl.style.color = currentPlayer === 'red' ? 'red' : 'navy';
}

function startGame() {
  gameOver = false;
  createBoard();

  // Read mode from radio buttons
  gameMode = document.querySelector('input[name="mode"]:checked').value;

  currentPlayer = Math.random() < 0.5 ? 'red' : 'navy';
  updateTurnDisplay();

  // Clear highlights if any
  clearHighlights();

  // If AI starts first, trigger AI move
  if (gameMode === 'pvc' && currentPlayer === 'navy') {
    setTimeout(aiMove, 600);
  }
}

// Checks for win starting from last placed piece at row, col
function checkWin(row, col) {
  function count(dirRow, dirCol) {
    let r = row + dirRow;
    let c = col + dirCol;
    const winningCells = [[row, col]];

    while (
      r >= 0 && r < ROWS &&
      c >= 0 && c < COLS &&
      board[r][c].classList.contains(currentPlayer)
    ) {
      winningCells.push([r, c]);
      r += dirRow;
      c += dirCol;
    }

    return winningCells;
  }

  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];

  for (const [dr, dc] of directions) {
    const line1 = count(dr, dc);
    const line2 = count(-dr, -dc);
    const totalLine = [...line1, ...line2.slice(1)];
    if (totalLine.length >= 4) {
      totalLine.forEach(([r, c]) => board[r][c].classList.add('highlight'));
      return true;
    }
  }
  return false;
}

// AI move: medium difficulty
function aiMove() {
  if (gameOver) return;

  // 1. Try winning move
  for (let c = 0; c < COLS; c++) {
    if (canWinNextMove(c, 'navy')) {
      makeMove(c, 'navy');
      finishAIMove();
      return;
    }
  }

  // 2. Block opponent win
  for (let c = 0; c < COLS; c++) {
    if (canWinNextMove(c, 'red')) {
      makeMove(c, 'navy');
      finishAIMove();
      return;
    }
  }

  // 3. Else pick random valid column
  let validCols = [];
  for (let c = 0; c < COLS; c++) {
    if (!board[0][c].classList.contains('red') && !board[0][c].classList.contains('navy')) {
      validCols.push(c);
    }
  }

  if (validCols.length === 0) return; // board full

  const randomCol = validCols[Math.floor(Math.random() * validCols.length)];
  makeMove(randomCol, 'navy');
  finishAIMove();
}

function finishAIMove() {
  if (checkWin(lastMoveRow, lastMoveCol)) {
    gameOver = true;
    launchConfetti('navy');
    currentPlayerEl.textContent = 'NAVY WINS!';
    return;
  }
  currentPlayer = 'red';
  updateTurnDisplay();
}

function canWinNextMove(col, player) {
  // Simulate move
  for (let r = ROWS - 1; r >= 0; r--) {
    const cell = board[r][col];
    if (!cell.classList.contains('red') && !cell.classList.contains('navy')) {
      cell.classList.add(player);
      const win = checkWin(r, col);
      cell.classList.remove(player);
      return win;
    }
  }
  return false;
}

function clearHighlights() {
  board.forEach(row => {
    row.forEach(cell => cell.classList.remove('highlight'));
  });
}

function launchConfetti(color) {
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.setProperty('--color', color);
    confetti.style.setProperty('--dx', (Math.random() * 200 - 100).toFixed(2));
    confetti.style.setProperty('--dy', (Math.random() * 200 - 100).toFixed(2));
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1500);
  }
}

startBtn.addEventListener('click', startGame);

