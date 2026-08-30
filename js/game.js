class Game {
  constructor(canvasId, playerCount) {
    this.canvas = document.getElementById(canvasId);
    this.board = new Board(this.canvas, this);
    this.players = [];
    this.currentPlayerIndex = 0;
    this.phase = 'ROLL_DICE';
    this.dice = [0, 0];
    this.waitingForAction = false;
    this.pendingTileIndex = -1;

    this.initPlayers(playerCount);   // 传入人数
    this.initUI();
    this.render();
    this.updatePanel();
  }
  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  initPlayers(playerCount) {
    // 默认名称列表
    const defaultNames = ['玩家1', '玩家2', '玩家3', '玩家4'];
    // 默认颜色列表（不同颜色区分棋子）
    const defaultColors = ['#FF4444', '#4444FF', '#44AA44', '#FFAA00'];

    for (let i = 0; i < playerCount; i++) {
        const player = new Player(i, defaultNames[i], false); // 全部为真人
        player.color = defaultColors[i];
        this.players.push(player);
    }
  }

  initUI() {
    document.getElementById('rollBtn').addEventListener('click', () => this.rollDice());
    document.getElementById('buyBtn').addEventListener('click', () => this.buyProperty());
    document.getElementById('skipBtn').addEventListener('click', () => this.skipBuy());
    document.getElementById('endTurnBtn').addEventListener('click', () => this.nextTurn());
  }

  // 开始当前玩家回合（如果是 AI 则自动掷骰子）
  startTurn() {
    if (this.checkWin()) return;
    this.phase = 'ROLL_DICE';
    this.updatePanel();
    if (this.currentPlayer.isAI) {
      // AI 自动掷骰子
      setTimeout(() => this.rollDice(), 1000);
    } else {
      this.showRollButton(true);
    }
  }

  // 掷骰子（由按钮触发）
  rollDice() {
    if (this.phase !== 'ROLL_DICE' || this.currentPlayer.isAI) return;
    this.doRoll();
  }

  doRoll() {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    this.dice = [die1, die2];
    const player = this.currentPlayer;
    const steps = die1 + die2;
    this.showMessage(`${player.name} 掷出了 ${die1} 和 ${die2}，前进 ${steps} 步`);
    
    // 如果在监狱，需要特殊处理（简化版：双骰出狱，否则跳过）
    if (player.inJail) {
      if (die1 === die2) {
        player.inJail = false;
        player.jailTurns = 0;
        this.showMessage(`${player.name} 双骰出狱！`);
      } else {
        player.jailTurns++;
        if (player.jailTurns >= 3) {
          player.cash -= 500; // 缴纳保释金
          player.inJail = false;
          player.jailTurns = 0;
          this.showMessage(`${player.name} 缴纳500保释金出狱`);
        } else {
          this.showMessage(`${player.name} 还在监狱，等待下次掷骰`);
          this.endTurn(); // 结束回合
          return;
        }
      }
    }

    // 移动玩家
    this.movePlayer(player, steps, () => {
      // 移动完成后处理格子事件
      this.board.handleLanding(player, player.position);
      // 更新界面
      this.updatePanel();
      // 如果没有需要玩家决策的操作，自动结束回合
      if (!this.waitingForAction) {
        this.endTurn();
      }
    });
  }

  // 移动玩家（带简单延迟）
  movePlayer(player, steps, callback) {
    const startPos = player.position;
    const endPos = (startPos + steps) % this.board.tiles.length;
    // 经过起点奖励
    if (endPos < startPos || steps >= this.board.tiles.length) {
      player.cash += 2000;
      this.showMessage(`${player.name} 经过校门，领取 2000`);
    }
    player.position = endPos;
    this.render();
    if (callback) setTimeout(callback, 500); // 延迟一点执行后续
  }

  // 处理地产到达（普通地产）
  handleProperty(player, tileIndex) {
    const tile = this.board.tiles[tileIndex];
    if (tile.owner === null) {
      // 无主地产，询问是否购买
      if (player.cash >= tile.price) {
        if (player.isAI) {
          // AI 简单策略：现金充足就买
          if (player.cash > tile.price + 1000) {
            this.buyProperty(tileIndex);
          } else {
            this.showMessage(`${player.name} 放弃购买 ${tile.name}`);
          }
        } else {
          // 真人玩家，显示购买按钮
          this.waitingForAction = true;
          this.pendingTileIndex = tileIndex;
          this.showBuyButtons(true);
          this.showMessage(`是否购买 ${tile.name}？价格 ${tile.price}`);
          return; // 等待玩家点击
        }
      } else {
        this.showMessage(`${player.name} 资金不足，无法购买 ${tile.name}`);
      }
    } else if (tile.owner !== player.id) {
      // 支付租金
      this.payRent(player, tile);
    }
    // 如果无需等待，继续
    if (!this.waitingForAction) {
      this.endTurn();
    }
  }

  // 处理交通格（校车站）
  handleTransport(player, tileIndex) {
    const tile = this.board.tiles[tileIndex];
    if (tile.owner === null) {
      // 无主，询问购买
      if (player.cash >= tile.price) {
        if (player.isAI) {
          if (player.cash > tile.price + 1000) {
            this.buyTransport(tileIndex);
          } else {
            this.showMessage(`${player.name} 放弃购买 ${tile.name}`);
          }
        } else {
          this.waitingForAction = true;
          this.pendingTileIndex = tileIndex;
          this.showBuyButtons(true);
          this.showMessage(`是否购买 ${tile.name}？价格 ${tile.price}`);
          return;
        }
      } else {
        this.showMessage(`${player.name} 资金不足，无法购买 ${tile.name}`);
      }
    } else if (tile.owner !== player.id) {
      // 支付租金：根据拥有校车站数量计算
      const owner = this.players.find(p => p.id === tile.owner);
      if (!owner || owner.bankrupt) return;
      const transportCount = owner.properties.filter(idx => this.board.tiles[idx].type === 'transport').length;
      const rent = 500 * transportCount; // 每个站500
      player.cash -= rent;
      owner.cash += rent;
      this.showMessage(`${player.name} 支付给 ${owner.name} 校车费 ${rent}`);
      this.checkBankruptcy(player);
    }
    if (!this.waitingForAction) {
      this.endTurn();
    }
  }

  // 处理公共事业格
  handleUtility(player, tileIndex) {
    const tile = this.board.tiles[tileIndex];
    if (tile.owner === null) {
      if (player.cash >= tile.price) {
        if (player.isAI) {
          if (player.cash > tile.price + 1000) {
            this.buyUtility(tileIndex);
          } else {
            this.showMessage(`${player.name} 放弃购买 ${tile.name}`);
          }
        } else {
          this.waitingForAction = true;
          this.pendingTileIndex = tileIndex;
          this.showBuyButtons(true);
          this.showMessage(`是否购买 ${tile.name}？价格 ${tile.price}`);
          return;
        }
      } else {
        this.showMessage(`${player.name} 资金不足，无法购买 ${tile.name}`);
      }
    } else if (tile.owner !== player.id) {
      const owner = this.players.find(p => p.id === tile.owner);
      if (!owner || owner.bankrupt) return;
      const utilityCount = owner.properties.filter(idx => this.board.tiles[idx].type === 'utility').length;
      const diceSum = this.dice[0] + this.dice[1];
      const rent = (utilityCount === 1) ? diceSum * 50 : diceSum * 100;
      player.cash -= rent;
      owner.cash += rent;
      this.showMessage(`${player.name} 支付给 ${owner.name} 公共事业费 ${rent}（骰子点数 ${diceSum}）`);
      this.checkBankruptcy(player);
    }
    if (!this.waitingForAction) {
      this.endTurn();
    }
  }

  // 购买普通地产
  buyProperty(tileIndex = this.pendingTileIndex) {
    const tile = this.board.tiles[tileIndex];
    const player = this.currentPlayer;
    player.cash -= tile.price;
    tile.owner = player.id;
    player.properties.push(tileIndex);
    this.showMessage(`${player.name} 购买了 ${tile.name}`);
    this.waitingForAction = false;
    this.showBuyButtons(false);
    this.render();
    this.endTurn();
  }

  // 购买交通格
  buyTransport(tileIndex = this.pendingTileIndex) {
    const tile = this.board.tiles[tileIndex];
    const player = this.currentPlayer;
    player.cash -= tile.price;
    tile.owner = player.id;
    player.properties.push(tileIndex);
    this.showMessage(`${player.name} 购买了 ${tile.name}`);
    this.waitingForAction = false;
    this.showBuyButtons(false);
    this.render();
    this.endTurn();
  }

  // 购买公共事业
  buyUtility(tileIndex = this.pendingTileIndex) {
    const tile = this.board.tiles[tileIndex];
    const player = this.currentPlayer;
    player.cash -= tile.price;
    tile.owner = player.id;
    player.properties.push(tileIndex);
    this.showMessage(`${player.name} 购买了 ${tile.name}`);
    this.waitingForAction = false;
    this.showBuyButtons(false);
    this.render();
    this.endTurn();
  }

  // 跳过购买
  skipBuy() {
    this.showMessage(`${this.currentPlayer.name} 放弃了购买`);
    this.waitingForAction = false;
    this.showBuyButtons(false);
    this.endTurn();
  }

  // 支付普通地产租金
  payRent(player, tile) {
    const owner = this.players.find(p => p.id === tile.owner);
    if (!owner || owner.bankrupt) return;
    let rent = tile.rent;
    // 检查是否成套（同颜色全部拥有则租金翻倍）
    const group = this.board.getColorGroup(tile.color);
    const allOwned = group.every(idx => this.board.tiles[idx].owner === owner.id);
    if (allOwned) rent *= 2;
    player.cash -= rent;
    owner.cash += rent;
    this.showMessage(`${player.name} 支付给 ${owner.name} 租金 ${rent}`);
    this.checkBankruptcy(player);
  }

  // 抽取卡片
  drawCard(player, type) {
    const deck = type === 'chance' ? CHANCE_CARDS : DESTINY_CARDS;
    const card = deck[Math.floor(Math.random() * deck.length)];
    this.showMessage(`${player.name} 抽到：${card.text}`);
    card.effect(player, this);
    this.checkBankruptcy(player);
    this.render();
    // 抽卡后可能导致位置变化，但为了简化，直接结束回合（除非需要购买）
    // 这里不处理卡片导致的购买需求
    this.endTurn();
  }

  // 检查破产
  checkBankruptcy(player) {
    if (player.cash < 0) {
      player.bankrupt = true;
      this.showMessage(`${player.name} 破产了！`);
      // 释放地产
      player.properties.forEach(idx => {
        this.board.tiles[idx].owner = null;
      });
      player.properties = [];
      if (this.checkWin()) return;
    }
  }

  // 检查胜利条件
  checkWin() {
    const alive = this.players.filter(p => !p.bankrupt);
    if (alive.length === 1) {
      this.showMessage(`${alive[0].name} 获胜！`);
      this.phase = 'GAME_OVER';
      this.showRollButton(false);
      return true;
    }
    return false;
  }

  // 结束当前回合，轮到下一位玩家
  endTurn() {
    if (this.phase === 'GAME_OVER') return;
    this.waitingForAction = false;
    this.showBuyButtons(false);
    // 找到下一个未破产的玩家
    let next = (this.currentPlayerIndex + 1) % this.players.length;
    while (this.players[next].bankrupt && next !== this.currentPlayerIndex) {
      next = (next + 1) % this.players.length;
    }
    this.currentPlayerIndex = next;
    this.startTurn();
  }

  // 界面更新
  updatePanel() {
    const infoDiv = document.getElementById('player-info');
    infoDiv.innerHTML = '';
    this.players.forEach(p => {
      const status = p.bankrupt ? '（破产）' : (p.id === this.currentPlayer.id ? ' <- 当前回合' : '');
      infoDiv.innerHTML += `<div style="color:${p.color}">${p.name}: ${p.cash} QSB ${status}</div>`;
    });
  }

  showMessage(msg) {
    document.getElementById('message').textContent = msg;
  }

  showRollButton(show) {
    document.getElementById('rollBtn').style.display = show ? 'inline-block' : 'none';
  }

  showBuyButtons(show) {
    document.getElementById('buyBtn').style.display = show ? 'inline-block' : 'none';
    document.getElementById('skipBtn').style.display = show ? 'inline-block' : 'none';
  }

  render() {
    this.board.draw(this.players);
    this.updatePanel();
  }
}