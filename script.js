import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCReQmN7LdlNNP1_rdqUD4NZuOHOmIw6uE",
  authDomain: "omok-online-7edda.firebaseapp.com",
  databaseURL: "https://omok-online-7edda-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "omok-online-7edda",
  storageBucket: "omok-online-7edda.appspot.com",
  messagingSenderId: "26980549630",
  appId: "1:26980549630:web:465e91e2a43d3a8581f6af"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const roomScreen = document.getElementById("room-screen");
const gameScreen = document.getElementById("game-screen");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");
const roomError = document.getElementById("room-error");
const boardEl = document.getElementById("board");
const placeBtn = document.getElementById("placeStoneBtn");
const playerInfoEl = document.getElementById("player-info");

let board = Array.from({ length: 15 }, () => Array(15).fill(0));
let turn = 1;
let myStone = null;
let winner = 0;
let roomId = "";
let selected = null;

function drawBoard() {
  boardEl.innerHTML = "";
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = x;
      cell.dataset.y = y;
      if (selected && selected.x === x && selected.y === y) {
        cell.classList.add("selected");
      }
      if (board[y][x] === 1 || board[y][x] === 2) {
        const stone = document.createElement("div");
        stone.className = "stone";
        stone.style.backgroundImage = `url(${board[y][x] === 1
          ? 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Go_ishi_black.svg'
          : 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Go_ishi_white.svg'})`;
        cell.appendChild(stone);
      }
      cell.addEventListener("click", () => {
        if (winner || board[y][x] !== 0 || turn !== myStone) return;
        selected = { x, y };
        drawBoard();
      });
      boardEl.appendChild(cell);
    }
  }
}

function save() {
  set(ref(db, `rooms/${roomId}`), { board, turn, winner });
}

function checkVictory(x, y, color) {
  const dir = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dx, dy] of dir) {
    let count = 1;
    for (let i = 1; i <= 4; i++) {
      let nx = x + dx*i, ny = y + dy*i;
      if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15 || board[ny][nx] !== color) break;
      count++;
    }
    for (let i = 1; i <= 4; i++) {
      let nx = x - dx*i, ny = y - dy*i;
      if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15 || board[ny][nx] !== color) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
}

joinBtn.addEventListener("click", () => {
  const code = roomInput.value.trim();
  if (!code) {
    roomError.textContent = "방 코드를 입력하세요.";
    return;
  }
  roomId = code;
  myStone = 2;
  board = Array.from({ length: 15 }, () => Array(15).fill(0));
  drawBoard();
  roomScreen.style.display = "none";
  gameScreen.style.display = "flex";
  const roomRef = ref(db, `rooms/${roomId}`);
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    board = data.board;
    turn = data.turn;
    winner = data.winner;
    drawBoard();
    playerInfoEl.textContent = `🔲 흑: 1P vs ⭕ 백: 2P`;
  });
});

placeBtn.addEventListener("click", () => {
  if (!selected || winner || turn !== myStone) return;
  const { x, y } = selected;
  if (board[y][x] !== 0) return;
  board[y][x] = myStone;
  if (checkVictory(x, y, myStone)) {
    winner = myStone;
    alert("🎉 승리!");
  }
  turn = 3 - turn;
  selected = null;
  save();
});
