let config = { boardSize: 3, winLength: 3, playerX: 'Igrač X', playerO: 'Igrač O' };
let board = [];
let currentPlayer = 'X';
let gameOver = false;
let scores = { X: 0, O: 0, draw: 0 };

async function loadConfig() {
  try {
    const res = await fetch('config.json');
    if (!res.ok) throw new Error('Nije moguće učitati config.json');
    const data = await res.json();
    config = { ...config, ...data };
    applyConfigToUI();
  } catch (e) {
    console.warn('config.json nije učitan, koriste se zadane vrijednosti.', e);
  }
}

function applyConfigToUI() {
  document.getElementById('input-size').value = config.boardSize;
  document.getElementById('input-win').value = config.winLength;
  document.getElementById('input-px').value = config.playerX;
  document.getElementById('input-po').value = config.playerO;
  document.getElementById('config-info').textContent =
    `Ploča: ${config.boardSize}×${config.boardSize} | Pobjeda: ${config.winLength} u nizu | config.json`;
}

function initBoard() {
  const size = config.boardSize;
  board = Array.from({ length: size }, () => Array(size).fill(''));
  currentPlayer = 'X';
  gameOver = false;
  renderBoard();
  setStatus(`Na redu: ${playerName(currentPlayer)}`);
  updateScoreboard();
}

function renderBoard() {
  const size = config.boardSize;
  const cellSize = Math.max(48, Math.min(80, Math.floor(460 / size)));
  const fontSize = Math.max(1, cellSize * 0.45) + 'px';

  const boardEl = document.getElementById('board');
  boardEl.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
  boardEl.innerHTML = '';

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell' + (board[r][c] ? ` ${board[r][c].toLowerCase()} taken` : '');
      cell.style.width = cellSize + 'px';
      cell.style.height = cellSize + 'px';
      cell.style.fontSize = fontSize;
      cell.textContent = board[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }
  }
}

function onCellClick(e) {
  if (gameOver) return;
  const r = +e.currentTarget.dataset.row;
  const c = +e.currentTarget.dataset.col;
  if (board[r][c]) return;

  board[r][c] = currentPlayer;
  renderBoard();

  const winning = checkWin(r, c);
  if (winning) {
    highlightWinning(winning);
    scores[currentPlayer]++;
    setStatus(`${playerName(currentPlayer)} pobijedio!`, 'winner-' + currentPlayer.toLowerCase());
    updateScoreboard();
    gameOver = true;
    return;
  }

  if (isBoardFull()) {
    scores.draw++;
    setStatus('Neriješeno!', 'draw');
    updateScoreboard();
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  setStatus(`Na redu: ${playerName(currentPlayer)}`);
}

function checkWin(row, col) {
  const size = config.boardSize;
  const k = config.winLength;
  const p = board[row][col];

  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr, dc] of directions) {
    const cells = [[row, col]];
    for (let i = 1; i < k; i++) {
      const nr = row + dr * i, nc = col + dc * i;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || board[nr][nc] !== p) break;
      cells.push([nr, nc]);
    }
    for (let i = 1; i < k; i++) {
      const nr = row - dr * i, nc = col - dc * i;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || board[nr][nc] !== p) break;
      cells.push([nr, nc]);
    }
    if (cells.length >= k) return cells;
  }
  return null;
}

function highlightWinning(cells) {
  const size = config.boardSize;
  const boardEl = document.getElementById('board');
  cells.forEach(([r, c]) => {
    const idx = r * size + c;
    boardEl.children[idx].classList.add('winning');
  });
}

function isBoardFull() {
  return board.every(row => row.every(cell => cell !== ''));
}

function setStatus(msg, cls = '') {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = cls;
}

function playerName(p) {
  return p === 'X' ? config.playerX : config.playerO;
}

function updateScoreboard() {
  document.getElementById('score-x').textContent = scores.X;
  document.getElementById('score-o').textContent = scores.O;
  document.getElementById('score-draw').textContent = scores.draw;
  document.getElementById('label-x').textContent = config.playerX;
  document.getElementById('label-o').textContent = config.playerO;
}

function applyNewConfig() {
  const size = parseInt(document.getElementById('input-size').value, 10);
  const win = parseInt(document.getElementById('input-win').value, 10);
  const px = document.getElementById('input-px').value.trim() || 'Igrač X';
  const po = document.getElementById('input-po').value.trim() || 'Igrač O';

  if (isNaN(size) || size < 2 || size > 15) return alert('Veličina ploče mora biti između 2 i 15.');
  if (isNaN(win) || win < 2 || win > size) return alert(`Duljina pobjede mora biti između 2 i ${size}.`);

  config.boardSize = size;
  config.winLength = win;
  config.playerX = px;
  config.playerO = po;

  document.getElementById('config-info').textContent =
    `Ploča: ${size}×${size} | Pobjeda: ${win} u nizu`;

  scores = { X: 0, O: 0, draw: 0 };
  initBoard();
}

document.getElementById('btn-restart').addEventListener('click', initBoard);
document.getElementById('btn-reset-score').addEventListener('click', () => {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
  initBoard();
});
document.getElementById('btn-apply').addEventListener('click', applyNewConfig);

loadConfig().then(initBoard);
