// 连接服务器
const socket = io();

let myRoomCode = null;
let isHost = false;
let board = null;
let currentState = null;

// DOM元素
const setupPanel = document.getElementById('setup-panel');
const gameContainer = document.getElementById('game-container');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCodeInput');
const roomInfoDiv = document.getElementById('room-info');
const startGameBtn = document.getElementById('startGameBtn');
const playerInfoDiv = document.getElementById('player-info');
const messageDiv = document.getElementById('message');
const rollBtn = document.getElementById('rollBtn');
const buyBtn = document.getElementById('buyBtn');
const skipBtn = document.getElementById('skipBtn');
const buildBtn = document.getElementById('buildBtn');
const mortgageBtn = document.getElementById('mortgageBtn');
const redeemBtn = document.getElementById('redeemBtn');
const actionButtonsDiv = document.getElementById('action-buttons');

// 初始化棋盘渲染
board = new Board(document.getElementById('boardCanvas'));

// 当前选中的格子索引（用于建造/抵押/赎回）
let selectedTileIndex = null;

// 创建房间
createRoomBtn.addEventListener('click', () => {
  socket.emit('create_room');
});

// 加入房间
joinRoomBtn.addEventListener('click', () => {
  const code = roomCodeInput.value.trim();
  if (code) socket.emit('join_room', code);
});

// 开始游戏（房主）
startGameBtn.addEventListener('click', () => {
  if (myRoomCode && isHost) socket.emit('start_game', myRoomCode);
});

// 掷骰子
rollBtn.addEventListener('click', () => {
  if (myRoomCode) socket.emit('roll_dice', myRoomCode);
});

// 购买
buyBtn.addEventListener('click', () => {
  if (myRoomCode) socket.emit('buy_property', myRoomCode);
});

// 跳过购买
skipBtn.addEventListener('click', () => {
  if (myRoomCode) socket.emit('skip_buy', myRoomCode);
});

// 建造
buildBtn.addEventListener('click', () => {
  if (selectedTileIndex !== null && myRoomCode) {
    socket.emit('build_house', myRoomCode, selectedTileIndex);
  } else {
    alert('请先点击棋盘上的地产格子');
  }
});

// 抵押
mortgageBtn.addEventListener('click', () => {
  if (selectedTileIndex !== null && myRoomCode) {
    socket.emit('mortgage', myRoomCode, selectedTileIndex);
  } else {
    alert('请先点击要抵押的地产格子');
  }
});

// 赎回
redeemBtn.addEventListener('click', () => {
  if (selectedTileIndex !== null && myRoomCode) {
    socket.emit('redeem', myRoomCode, selectedTileIndex);
  } else {
    alert('请先点击要赎回的地产格子');
  }
});

// 棋盘点击事件：选中格子，并可能弹出操作提示
document.getElementById('boardCanvas').addEventListener('click', (e) => {
  if (!currentState) return;
  const rect = e.target.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  // 查找点击的格子索引
  for (let i = 0; i < 40; i++) {
    const pos = board.positions[i];
    if (mouseX >= pos.x && mouseX < pos.x + board.tileSize &&
        mouseY >= pos.y && mouseY < pos.y + board.tileSize) {
      selectedTileIndex = i;
      // 高亮选中的格子（可暂时不处理）
      break;
    }
  }
});

// 监听房间创建成功
socket.on('room_created', (data) => {
  myRoomCode = data.roomCode;
  isHost = true;
  roomInfoDiv.innerHTML = `房间号：${data.roomCode}<br>等待玩家加入...`;
  startGameBtn.style.display = 'inline-block';
});

// 监听房间更新
socket.on('room_update', (data) => {
  if (myRoomCode) {
    let html = `房间号：${myRoomCode}<br>玩家：`;
    data.players.forEach(p => {
      html += `<div style="color:${p.color}">${p.name}</div>`;
    });
    roomInfoDiv.innerHTML = html;
    if (isHost && data.players.length >= 2) startGameBtn.style.display = 'inline-block';
    else startGameBtn.style.display = 'none';
  }
});

// 游戏开始
socket.on('game_started', () => {
  setupPanel.style.display = 'none';
  gameContainer.style.display = 'flex';
});

// 接收游戏状态
socket.on('game_state', (state) => {
  currentState = state;
  renderGame(state);
});

// 需要玩家操作（购买提示）
socket.on('action_required', (data) => {
  if (data.playerId === socket.id) {
    buyBtn.style.display = 'inline-block';
    skipBtn.style.display = 'inline-block';
    messageDiv.textContent = '是否购买该地产？';
  }
});

// 错误处理
socket.on('error', (msg) => alert(msg));

// 渲染游戏状态
function renderGame(state) {
  // 更新玩家信息
  let infoHtml = '';
  state.players.forEach(p => {
    const status = p.bankrupt ? '（破产）' : (state.players[state.currentPlayerIndex].id === p.id ? ' <- 当前回合' : '');
    infoHtml += `<div style="color:${p.color}">${p.name}: ${p.cash} QSB ${status}</div>`;
  });
  playerInfoDiv.innerHTML = infoHtml;

  // 绘制棋盘（传入骰子和日志）
  // 绘制棋盘（传入骰子和日志）
const playersMap = {};
state.players.forEach(p => { playersMap[String(p.id)] = p.color; });
const tilesWithOwnerColor = state.tiles.map(t => ({
  ...t,
  ownerColor: t.owner !== null ? (playersMap[String(t.owner)] || '#333') : null
}));
board.draw(state.players, tilesWithOwnerColor, state.dice, state.logs, state.players[state.currentPlayerIndex].name);

  // 按钮显示控制
  const isMyTurn = state.players[state.currentPlayerIndex].id === socket.id;
  const myPlayer = state.players.find(p => p.id === socket.id);

  // 默认隐藏所有操作按钮
  rollBtn.style.display = 'none';
  buyBtn.style.display = 'none';
  skipBtn.style.display = 'none';
  buildBtn.style.display = 'none';
  mortgageBtn.style.display = 'none';
  redeemBtn.style.display = 'none';

  if (state.phase === 'GAME_OVER') {
    messageDiv.textContent = `游戏结束！${state.winner || ''} 获胜！`;
    return;
  }

  if (isMyTurn) {
    if (state.phase === 'ROLL_DICE' && !state.waitingForAction) {
      rollBtn.style.display = 'inline-block';
      // 显示建造、抵押、赎回按钮（如果拥有地产）
      if (myPlayer && myPlayer.properties.length > 0) {
        buildBtn.style.display = 'inline-block';
        mortgageBtn.style.display = 'inline-block';
        redeemBtn.style.display = 'inline-block';
      }
    } else if (state.waitingForAction) {
      // 等待购买决策
      buyBtn.style.display = 'inline-block';
      skipBtn.style.display = 'inline-block';
    }
  }

  // 显示消息
  if (state.logs && state.logs.length > 0) {
    messageDiv.textContent = state.logs[0].message;
  }
}