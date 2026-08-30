const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 托管静态文件（游戏前端）
app.use(express.static(path.join(__dirname, '/')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ 游戏数据（服务器端） ============
const BOARD_DATA = [
   // 0：起点
  { type: 'start', name: '紫金港南大门' },

  // 1：棕色组 - 生活区
  { type: 'property', name: '紫云碧峰学园', price: 600, rent: 50, color: '#8B4513' },
  // 2：机会
  { type: 'chance', name: '校园卡' },
  // 3：棕色组 - 生活区
  { type: 'property', name: '丹阳青溪学园', price: 600, rent: 50, color: '#8B4513' },

  // 4：税
  { type: 'tax', name: '缴学费', amount: 1000 },

  // 5：交通 - 校车
  { type: 'transport', name: '藕舫路', price: 2000 },

  // 6：浅蓝组 - 教学区
  { type: 'property', name: '东二教学楼', price: 1000, rent: 100, color: '#1E90FF' },
  // 7：命运
  { type: 'destiny', name: '考试周' },
  // 8：浅蓝组 - 教学区
  { type: 'property', name: '段永平教学楼', price: 1000, rent: 100, color: '#1E90FF' },
  // 9：浅蓝组 - 教学区
  { type: 'property', name: '西一教学楼', price: 1200, rent: 120, color: '#1E90FF' },

  // 10：监狱（访问）
  { type: 'jail', name: '接受监督[路过]' },

  // 11：粉色组 - 公共设施
  { type: 'property', name: '主图书馆', price: 1400, rent: 150, color: '#FF69B4' },
  // 12：公共事业 - 校园网
  { type: 'utility', name: '银泉健身房', price: 1500 },
  // 13：粉色组 - 公共设施
  { type: 'property', name: '浙大医院', price: 1400, rent: 150, color: '#FF69B4' },
  // 14：粉色组 - 公共设施
  { type: 'property', name: '紫金港剧场', price: 1600, rent: 180, color: '#FF69B4' },

  // 15：交通 - 校车
  { type: 'transport', name: '迪臣路', price: 2000 },

  // 16：橙色组 - 学院群（医药）
  { type: 'property', name: '医学院', price: 1800, rent: 200, color: '#FFA500' },
  // 17：机会
  { type: 'chance', name: '校园卡' },
  // 18：橙色组 - 学院群
  { type: 'property', name: '药学院', price: 1800, rent: 200, color: '#FFA500' },
  // 19：橙色组 - 学院群
  { type: 'property', name: '生命科学学院', price: 2000, rent: 220, color: '#FFA500' },

  // 20：免费休息
  { type: 'free', name: '启真湖畔 免费休息' },

  // 21：红色组 - 学院群（工科）
  { type: 'property', name: '计算机学院', price: 2200, rent: 250, color: '#FF0000' },
  // 22：命运
  { type: 'destiny', name: '考试周' },
  // 23：红色组 - 学院群
  { type: 'property', name: '化学系', price: 2200, rent: 250, color: '#FF0000' },
  // 24：红色组 - 学院群
  { type: 'property', name: '光电学院', price: 2400, rent: 280, color: '#FF0000' },

  // 25：交通 - 校车
  { type: 'transport', name: '宜山路', price: 2000 },

  // 26：黄色组 - 学院群（社科）
  { type: 'property', name: '教育学院', price: 2600, rent: 300, color: '#FFD700' },
  // 27：黄色组 - 学院群
  { type: 'property', name: '经济学院', price: 2600, rent: 300, color: '#FFD700' },
  // 28：公共事业 - 物业
  { type: 'utility', name: '白沙综合服务中心', price: 1500 },
  // 29：黄色组 - 学院群
  { type: 'property', name: '公共管理学院', price: 2800, rent: 350, color: '#FFD700' },

  // 30：去监狱
  { type: 'go_to_jail', name: '骑电车不戴头盔被记' },

  // 31：绿色组 - 学院群（农环）
  { type: 'property', name: '农学院', price: 3000, rent: 400, color: '#32CD32' },
  // 32：绿色组 - 学院群
  { type: 'property', name: '环境与资源学院', price: 3000, rent: 400, color: '#32CD32' },
  // 33：机会
  { type: 'chance', name: '校园卡' },
  // 34：绿色组 - 学院群
  { type: 'property', name: '动物科学学院', price: 3200, rent: 450, color: '#32CD32' },

  // 35：交通 - 校车
  { type: 'transport', name: '求是大道', price: 2000 },

  // 36：命运
  { type: 'destiny', name: '考试周' },
  // 37：深蓝组 - 标志性建筑
  { type: 'property', name: '月牙楼', price: 3500, rent: 500, color: '#6495ED' },
  // 38：税
  { type: 'tax', name: '缴住宿费', amount: 2000 },
  // 39：深蓝组 - 标志性建筑
  { type: 'property', name: '纳米楼', price: 4000, rent: 600, color: '#6495ED' },
];

const CHANCE_CARDS = [
  { text: '获得奖学金 500', effect: (player, game) => { player.cash += 500; } },
  { text: '拔他人充电器，罚款 100', effect: (player, game) => { player.cash -= 100; } },
  { text: '食堂免单，获得 200', effect: (player, game) => { player.cash += 200; } },
  { text: '前进到校门，领取 2000', effect: (player, game) => { 
      player.position = 0; 
      player.cash += 2000; 
      game.addLog(`${player.name} 前进到校门，领取 2000`); 
  }},
  { text: '后退 3 步', effect: (player, game) => { 
      player.position = (player.position - 3 + BOARD_DATA.length) % BOARD_DATA.length; 
      game.addLog(`${player.name} 后退 3 步`); 
  }},
  { text: '捡到钱包交给保卫处，奖励 300', effect: (player, game) => { player.cash += 300; } },
  { text: '参加校园活动，获得纪念品奖励 150', effect: (player, game) => { player.cash += 150; } },
  { text: '电瓶车被拖走，罚款 200', effect: (player, game) => { player.cash -= 200; } },
  { text: '获得优秀学生干部奖金 800', effect: (player, game) => { player.cash += 800; } },
  { text: '买奶茶请客，花费 100', effect: (player, game) => { player.cash -= 100; } },
  { text: '前进到启真湖畔休息', effect: (player, game) => {
      player.position = 20; // 启真湖畔的索引
      game.addLog(`${player.name} 前进到启真湖畔休息`);
  }},
  { text: '直接前往校车总站', effect: (player, game) => {
      player.position = 5; // 校车总站索引
      game.addLog(`${player.name} 直接前往校车总站`);
  }},
];
const DESTINY_CARDS = [
  { text: '考试作弊被抓，罚款 500', effect: (player, game) => { player.cash -= 500; } },
  { text: '绩点达标，奖励 300', effect: (player, game) => { player.cash += 300; } },
  { text: '实验室事故，损失 800', effect: (player, game) => { player.cash -= 800; } },
  { text: '直接送往监狱（骑电瓶车不戴头盔）', effect: (player, game) => { 
      player.position = 10; player.inJail = true; player.jailTurns = 0; 
      game.addLog(`${player.name} 被送往监狱！`); 
  }},
  { text: '获得导师红包 400', effect: (player, game) => { player.cash += 400; } },
  { text: '通宵复习生病，医药费 300', effect: (player, game) => { player.cash -= 300; } },
  { text: '论文发表，奖励 1000', effect: (player, game) => { player.cash += 1000; } },
  { text: '错过考试，重修费 600', effect: (player, game) => { player.cash -= 600; } },
  { text: '获得国家奖学金 2000', effect: (player, game) => { player.cash += 2000; } },
  { text: '小组作业队友划水，多花时间损失 200', effect: (player, game) => { player.cash -= 200; } },
  { text: '退后到最近的地产', effect: (player, game) => {
      let pos = player.position;
      do { pos = (pos - 1 + BOARD_DATA.length) % BOARD_DATA.length; } while (BOARD_DATA[pos].type !== 'property');
      player.position = pos; game.addLog(`${player.name} 退后到最近的地产`); 
  }},
  { text: '前进到月牙楼', effect: (player, game) => { player.position = 37; game.addLog(`${player.name} 前进到月牙楼`); }},
];

// ============ 游戏房间管理 ============
const rooms = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// 游戏状态类（每个房间一个）
class GameState {
  constructor(players) {
    this.players = players.map((p, i) => ({
      id: p.id,
      name: p.name || `玩家${i+1}`,
      cash: 15000,
      position: 0,
      properties: [],
      isAI: false,
      inJail: false,
      jailTurns: 0,
      bankrupt: false,
      color: p.color || ['#FF4444','#4444FF','#44AA44','#FFAA00'][i]
    }));
    this.tiles = BOARD_DATA.map(tile => ({...tile, owner: null, level: 0, mortgaged: false}));
    this.currentPlayerIndex = 0;
    this.phase = 'ROLL_DICE';
    this.dice = [0,0];
    this.waitingForAction = false;
    this.pendingTileIndex = -1;
    this.logs = [];  // 事件日志，最多保留10条
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  addLog(message) {
    this.logs.unshift({ time: Date.now(), message });
    if (this.logs.length > 10) this.logs.pop();
  }

  // 判断玩家是否拥有某颜色组全部地产
  hasColorGroup(playerId, color) {
    const groupIndices = this.tiles
      .map((t, i) => t.type === 'property' && t.color === color ? i : -1)
      .filter(i => i !== -1);
    return groupIndices.length > 0 && groupIndices.every(idx => this.tiles[idx].owner === playerId);
  }

  // 建造费用计算
  getBuildCost(tile) {
    if (tile.level === 0 || tile.level === 1) return 500;  // 建造自习室
    if (tile.level === 2) return 1000;  // 升级为宿舍
    return -1; // 不可再建
  }

  // 尝试建造
  buildHouse(playerId, tileIndex) {
    const player = this.players.find(p => p.id === playerId);
    const tile = this.tiles[tileIndex];
    if (!player || !tile || tile.type !== 'property' || tile.owner !== playerId) return { success: false, message: '不能在此建造' };
    if (!this.hasColorGroup(playerId, tile.color)) return { success: false, message: '需要拥有同色组全部地产' };
    if (tile.mortgaged) return { success: false, message: '已抵押的地产不能建造' };
    const cost = this.getBuildCost(tile);
    if (cost === -1) return { success: false, message: '已升到最高级' };
    if (player.cash < cost) return { success: false, message: '现金不足' };
    player.cash -= cost;
    tile.level += 1;
    if (tile.level === 3) this.addLog(`${player.name} 将 ${tile.name} 升级为宿舍`);
    else this.addLog(`${player.name} 在 ${tile.name} 建造了自习室`);
    return { success: true };
  }

  // 抵押地产
  mortgageProperty(playerId, tileIndex) {
    const player = this.players.find(p => p.id === playerId);
    const tile = this.tiles[tileIndex];
    if (!player || !tile || tile.owner !== playerId || tile.mortgaged) return { success: false, message: '无法抵押' };
    if (tile.level > 0) return { success: false, message: '有建筑的地产不能抵押，请先拆除建筑' };
    const mortgageValue = Math.floor(tile.price / 2);
    player.cash += mortgageValue;
    tile.mortgaged = true;
    this.addLog(`${player.name} 抵押了 ${tile.name}，获得 ${mortgageValue}`);
    return { success: true };
  }

  // 赎回抵押地产
  redeemProperty(playerId, tileIndex) {
    const player = this.players.find(p => p.id === playerId);
    const tile = this.tiles[tileIndex];
    if (!player || !tile || tile.owner !== playerId || !tile.mortgaged) return { success: false, message: '无法赎回' };
    const redeemCost = Math.floor(tile.price * 0.55); // 抵押价值 + 10%利息
    if (player.cash < redeemCost) return { success: false, message: '现金不足' };
    player.cash -= redeemCost;
    tile.mortgaged = false;
    this.addLog(`${player.name} 赎回了 ${tile.name}`);
    return { success: true };
  }

  // 获取可发送给客户端的精简状态
  getPublicState() {
    return {
      players: this.players.map((p, i) => ({
        id: p.id,
        name: p.name,
        cash: p.cash,
        position: p.position,
        properties: p.properties,
        inJail: p.inJail,
        bankrupt: p.bankrupt,
        color: p.color || ['#FF4444','#4444FF','#44AA44','#FFAA00'][i]
      })),
      tiles: this.tiles.map(t => ({
        type: t.type,
        name: t.name,
        price: t.price,
        rent: t.rent,
        color: t.color,
        amount: t.amount,
        owner: t.owner,
        level: t.level,
        mortgaged: t.mortgaged
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      phase: this.phase,
      dice: this.dice,
      waitingForAction: this.waitingForAction,
      pendingTileIndex: this.pendingTileIndex,
      logs: this.logs.slice(0, 6)  // 最近6条日志
    };
  }
}

// 处理玩家到达格子后的逻辑
function handleLanding(game, player) {
  const tile = game.tiles[player.position];
  switch (tile.type) {
    case 'property':
      handleProperty(game, player);
      break;
    case 'transport':
      handleTransport(game, player);
      break;
    case 'utility':
      handleUtility(game, player);
      break;
    case 'chance':
      drawCard(game, player, 'chance');
      break;
    case 'destiny':
      drawCard(game, player, 'destiny');
      break;
    case 'tax':
      player.cash -= tile.amount;
      game.addLog(`${player.name} 支付了 ${tile.amount} 费用`);
      checkBankruptcy(game, player);
      break;
    case 'jail':
      game.addLog(`${player.name} 在监狱门口张望`);
      break;
    case 'go_to_jail':
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      game.addLog(`${player.name} 被处分，直接送往监狱！`);
      break;
    case 'free':
      game.addLog(`${player.name} 在启真湖畔休息`);
      break;
    default:
      break;
  }
  checkWin(game);
  if (!game.waitingForAction && game.phase !== 'GAME_OVER') {
    endTurn(game);
  }
  // 确保广播最终状态
  broadcastGameState(game);
}

function handleProperty(game, player) {
  const tile = game.tiles[player.position];
  if (tile.owner === null) {
    if (player.cash >= tile.price) {
      game.waitingForAction = true;
      game.pendingTileIndex = player.position;
      broadcastAction(game);
      // 立即广播状态，以便客户端显示购买按钮
      broadcastGameState(game);
    } else {
      game.addLog(`${player.name} 资金不足，无法购买 ${tile.name}`);
      game.waitingForAction = false;
    }
  } else if (tile.owner !== player.id) {
    if (!tile.mortgaged) {
      payRent(game, player, tile);
    } else {
      game.addLog(`${tile.name} 已被抵押，无需支付租金`);
    }
  }
}

function handleTransport(game, player) {
  const tile = game.tiles[player.position];
  if (tile.owner === null) {
    if (player.cash >= tile.price) {
      game.waitingForAction = true;
      game.pendingTileIndex = player.position;
      broadcastAction(game);
      broadcastGameState(game);
    } else {
      game.waitingForAction = false;
    }
  } else if (tile.owner !== player.id) {
    if (!tile.mortgaged) {
      const owner = game.players.find(p => p.id === tile.owner);
      if (!owner || owner.bankrupt) return;
      const count = owner.properties.filter(idx => game.tiles[idx].type === 'transport' && !game.tiles[idx].mortgaged).length;
      const rent = 500 * count;
      player.cash -= rent;
      owner.cash += rent;
      game.addLog(`${player.name} 支付给 ${owner.name} 校车费 ${rent}`);
      checkBankruptcy(game, player);
    }
  }
}

function handleUtility(game, player) {
  const tile = game.tiles[player.position];
  if (tile.owner === null) {
    if (player.cash >= tile.price) {
      game.waitingForAction = true;
      game.pendingTileIndex = player.position;
      broadcastAction(game);
      broadcastGameState(game);
    } else {
      game.waitingForAction = false;
    }
  } else if (tile.owner !== player.id) {
    if (!tile.mortgaged) {
      const owner = game.players.find(p => p.id === tile.owner);
      if (!owner || owner.bankrupt) return;
      const count = owner.properties.filter(idx => game.tiles[idx].type === 'utility' && !game.tiles[idx].mortgaged).length;
      const diceSum = game.dice[0] + game.dice[1];
      const rent = (count === 1) ? diceSum * 50 : diceSum * 100;
      player.cash -= rent;
      owner.cash += rent;
      game.addLog(`${player.name} 支付给 ${owner.name} 公共事业费 ${rent}`);
      checkBankruptcy(game, player);
    }
  }
}

function payRent(game, player, tile) {
  const owner = game.players.find(p => p.id === tile.owner);
  if (!owner || owner.bankrupt) return;
  let rent = tile.rent;
  // 等级加成：1级+50，2级+150，3级+300
  const levelBonus = [0, 50, 150, 300];
  rent += levelBonus[tile.level] || 0;
  const group = game.tiles.map((t,i) => t.type === 'property' && t.color === tile.color ? i : -1).filter(i => i !== -1);
  const allOwned = group.every(idx => game.tiles[idx].owner === owner.id);
  if (allOwned) rent *= 2;
  player.cash -= rent;
  owner.cash += rent;
  game.addLog(`${player.name} 支付给 ${owner.name} 租金 ${rent}`);
  checkBankruptcy(game, player);
}

function drawCard(game, player, type) {
  const deck = type === 'chance' ? CHANCE_CARDS : DESTINY_CARDS;
  const card = deck[Math.floor(Math.random() * deck.length)];
  game.addLog(`${player.name} 抽到：${card.text}`);
  card.effect(player, game);
  checkBankruptcy(game, player);
}

// 检查破产（先尝试自动抵押）
function checkBankruptcy(game, player) {
  if (player.cash >= 0) return;

  // 自动抵押未抵押且无等级的地产
  const mortgagableTiles = player.properties.filter(idx => {
    const tile = game.tiles[idx];
    return tile.owner === player.id && !tile.mortgaged && tile.level === 0;
  });
  for (const idx of mortgagableTiles) {
    if (player.cash >= 0) break;
    const tile = game.tiles[idx];
    const mortgageValue = Math.floor(tile.price / 2);
    player.cash += mortgageValue;
    tile.mortgaged = true;
    game.addLog(`${player.name} 自动抵押了 ${tile.name}，获得 ${mortgageValue}`);
  }

  if (player.cash < 0) {
    player.bankrupt = true;
    game.addLog(`${player.name} 破产了！`);
    player.properties.forEach(idx => {
      const tile = game.tiles[idx];
      tile.owner = null;
      tile.level = 0;
      tile.mortgaged = false;
    });
    player.properties = [];
    checkWin(game);
  }
}

function checkWin(game) {
  const alive = game.players.filter(p => !p.bankrupt);
  if (alive.length === 1) {
    game.phase = 'GAME_OVER';
    game.winner = alive[0].name;
    game.addLog(`游戏结束，${alive[0].name} 获胜！`);
  }
}

function endTurn(game) {
  game.waitingForAction = false;
  let next = (game.currentPlayerIndex + 1) % game.players.length;
  while (game.players[next].bankrupt && next !== game.currentPlayerIndex) {
    next = (next + 1) % game.players.length;
  }
  game.currentPlayerIndex = next;
  game.phase = 'ROLL_DICE';
}

function broadcastAction(game) {
  io.to(game.roomCode).emit('action_required', { playerId: game.currentPlayer.id, tileIndex: game.pendingTileIndex });
}

function broadcastGameState(game) {
  io.to(game.roomCode).emit('game_state', game.getPublicState());
}

// ============ Socket.io 事件 ============
io.on('connection', (socket) => {
  console.log('新连接:', socket.id);

  socket.on('create_room', (targetCount) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      code: roomCode,
      host: socket.id,
      players: [],
      game: null,
      gameStarted: false,
      targetCount: targetCount || 2   // 目标人数，默认2
    };
    socket.join(roomCode);
    rooms[roomCode].players.push({ id: socket.id, name: '玩家1', color: '#FF4444' });
    socket.emit('room_created', { roomCode });
    io.to(roomCode).emit('room_update', {
      players: rooms[roomCode].players.map(p => ({id:p.id, name:p.name, color:p.color})),
      host: rooms[roomCode].host,
      targetCount: rooms[roomCode].targetCount
    });
  });

  socket.on('join_room', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) { socket.emit('error', '房间不存在'); return; }
    if (room.gameStarted) { socket.emit('error', '游戏已开始'); return; }
    if (room.players.length >= room.targetCount) { socket.emit('error', '房间已满'); return; }
    socket.join(roomCode);
    const color = ['#4444FF','#44AA44','#FFAA00'][room.players.length-1] || '#FF44FF';
    room.players.push({ id: socket.id, name: `玩家${room.players.length+1}`, color });
    io.to(roomCode).emit('room_update', {
      players: room.players.map(p => ({id:p.id, name:p.name, color:p.color})),
      host: room.host,
      targetCount: room.targetCount
    });
  });

  socket.on('start_game', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || room.host !== socket.id) return;
    if (room.players.length !== room.targetCount) {
      socket.emit('error', `等待所有玩家加入（需要${room.targetCount}人）`);
      return;
    }
    if (room.gameStarted) return;
    room.gameStarted = true;
    room.game = new GameState(room.players);
    room.game.roomCode = roomCode;
    io.to(roomCode).emit('game_started');
    broadcastGameState(room.game);
  });

  socket.on('roll_dice', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const game = room.game;
    if (game.phase !== 'ROLL_DICE') return;
    const player = game.currentPlayer;
    if (player.id !== socket.id) return;

    if (player.inJail) {
      const d1 = Math.floor(Math.random()*6)+1;
      const d2 = Math.floor(Math.random()*6)+1;
      game.dice = [d1, d2];
      if (d1 === d2) {
        player.inJail = false;
        player.jailTurns = 0;
        game.addLog(`${player.name} 双骰出狱！`);
      } else {
        player.jailTurns++;
        if (player.jailTurns >= 3) {
          player.cash -= 500;
          player.inJail = false;
          player.jailTurns = 0;
          game.addLog(`${player.name} 缴纳500保释金出狱`);
        } else {
          game.addLog(`${player.name} 还在监狱，跳过回合`);
          endTurn(game);
          broadcastGameState(game);
          return;
        }
      }
      const steps = d1 + d2;
      movePlayer(game, player, steps);
    } else {
      const d1 = Math.floor(Math.random()*6)+1;
      const d2 = Math.floor(Math.random()*6)+1;
      game.dice = [d1, d2];
      const steps = d1 + d2;
      movePlayer(game, player, steps);
    }
    broadcastGameState(game);
  });

  socket.on('buy_property', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const game = room.game;
    if (!game.waitingForAction) return;
    const player = game.currentPlayer;
    if (player.id !== socket.id) return;
    const tileIndex = game.pendingTileIndex;
    const tile = game.tiles[tileIndex];
    if (player.cash >= tile.price) {
      player.cash -= tile.price;
      tile.owner = player.id;
      player.properties.push(tileIndex);
      game.addLog(`${player.name} 购买了 ${tile.name}`);
    }
    game.waitingForAction = false;
    endTurn(game);
    broadcastGameState(game);
  });

  socket.on('skip_buy', (roomCode) => {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const game = room.game;
    if (!game.waitingForAction) return;
    const player = game.currentPlayer;
    if (player.id !== socket.id) return;
    game.waitingForAction = false;
    endTurn(game);
    broadcastGameState(game);
  });

  socket.on('build_house', (roomCode, tileIndex) => {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const game = room.game;
    if (game.phase !== 'ROLL_DICE' && !game.waitingForAction) return;
    const player = game.currentPlayer;
    if (player.id !== socket.id) return;
    const result = game.buildHouse(player.id, tileIndex);
    if (result.success) {
      broadcastGameState(game);
    } else {
      socket.emit('error', result.message);
    }
  });

  socket.on('mortgage', (roomCode, tileIndex) => {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const game = room.game;
    if (game.phase !== 'ROLL_DICE' && !game.waitingForAction) return;
    const player = game.currentPlayer;
    if (player.id !== socket.id) return;
    const result = game.mortgageProperty(player.id, tileIndex);
    if (result.success) {
      broadcastGameState(game);
    } else {
      socket.emit('error', result.message);
    }
  });

  socket.on('redeem', (roomCode, tileIndex) => {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const game = room.game;
    if (game.phase !== 'ROLL_DICE' && !game.waitingForAction) return;
    const player = game.currentPlayer;
    if (player.id !== socket.id) return;
    const result = game.redeemProperty(player.id, tileIndex);
    if (result.success) {
      broadcastGameState(game);
    } else {
      socket.emit('error', result.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('断开:', socket.id);
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(code).emit('room_update', {
          players: room.players.map(p => ({id:p.id, name:p.name, color:p.color})),
          host: room.host,
          targetCount: room.targetCount
        });
        if (room.players.length === 0) delete rooms[code];
      }
    }
  });
});

// 移动玩家
function movePlayer(game, player, steps) {
  const start = player.position;
  const end = (start + steps) % game.tiles.length;
  if (end < start || steps >= game.tiles.length) {
    player.cash += 2000;
    game.addLog(`${player.name} 经过校门，领取 2000`);
  }
  player.position = end;
  handleLanding(game, player);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});