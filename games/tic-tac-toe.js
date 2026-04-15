const cells = Array.from(document.querySelectorAll(".cell"));
const statusEl = document.getElementById("current-player");
const resetButton = document.getElementById("reset");

let currentPlayer = "X";
let board = Array(9).fill("");
let isGameOver = false;

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const updateStatus = (message) => {
  statusEl.textContent = message;
};

const checkWinner = () => {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const handleCellClick = (event) => {
  if (isGameOver) return;
  const index = Number(event.currentTarget.dataset.index);
  if (board[index]) return;

  board[index] = currentPlayer;
  event.currentTarget.textContent = currentPlayer;
  event.currentTarget.disabled = true;

  const winner = checkWinner();
  if (winner) {
    isGameOver = true;
    updateStatus(`Победа: ${winner}`);
    return;
  }

  if (board.every((cell) => cell)) {
    isGameOver = true;
    updateStatus("Ничья");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Ходит: ${currentPlayer}`);
};

const resetGame = () => {
  currentPlayer = "X";
  board = Array(9).fill("");
  isGameOver = false;
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
  });
  updateStatus("Ходит: X");
};

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", resetGame);
