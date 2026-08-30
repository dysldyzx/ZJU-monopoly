class Board {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileSize = 65;
    this.margin = 30;
    this.tilesPerSide = 9;
    this.positions = this.calculatePositions();
    // 中央区域坐标（用于绘制骰子和日志）
    this.centerX = this.margin + this.tileSize * (this.tilesPerSide + 2) / 2;
    this.centerY = this.margin + this.tileSize * (this.tilesPerSide + 2) / 2;
  }

  calculatePositions() {
    const positions = [];
    const step = this.tileSize;
    const sideLen = this.tilesPerSide; // 9
    // 四个角的索引：右下=0，左下=10，左上=20，右上=30
    // 路径顺时针：从右下角出发，沿底边向左走到左下角（索引1~9），然后左边向上到左上角（索引11~19），
    // 顶边向右到右上角（索引21~29），右边向下回到右下角（索引31~39）
    for (let i = 0; i < 40; i++) {
        let x, y;
        if (i === 0) { // 右下角
            x = this.margin + (sideLen + 1) * step;
            y = this.margin + (sideLen + 1) * step;
        } else if (i >= 1 && i <= 9) { // 底边（从右下角向左下角，即从右到左）
            x = this.margin + (sideLen + 1 - i) * step;
            y = this.margin + (sideLen + 1) * step;
        } else if (i === 10) { // 左下角
            x = this.margin;
            y = this.margin + (sideLen + 1) * step;
        } else if (i >= 11 && i <= 19) { // 左边（从左下角向左上角，即从下到上）
            x = this.margin;
            y = this.margin + (sideLen + 1 - (i - 10)) * step;
        } else if (i === 20) { // 左上角
            x = this.margin;
            y = this.margin;
        } else if (i >= 21 && i <= 29) { // 顶边（从左上角向右上角，即从左到右）
            x = this.margin + (i - 20) * step;
            y = this.margin;
        } else if (i === 30) { // 右上角
            x = this.margin + (sideLen + 1) * step;
            y = this.margin;
        } else if (i >= 31 && i <= 39) { // 右边（从右上角向右下角，即从上到下）
            x = this.margin + (sideLen + 1) * step;
            y = this.margin + (i - 30) * step;
        }
        positions.push({ x, y });
    }
    return positions;
}

  // 主绘制方法
  draw(players, tiles, dice, logs, currentPlayerId) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 构建玩家ID到颜色的映射
    const playersMap = {};
    players.forEach(p => { playersMap[String(p.id)] = p.color; });

    // 绘制棋盘外框
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.margin, this.margin, this.tileSize * (this.tilesPerSide + 2), this.tileSize * (this.tilesPerSide + 2));

    // 绘制格子
    tiles.forEach((tile, index) => {
      const pos = this.positions[index];
      const x = pos.x, y = pos.y, w = this.tileSize, h = this.tileSize;
      this.drawTile(ctx, tile, x, y, w, h, playersMap);
    });

    // 绘制玩家棋子
    players.forEach(player => {
      if (player.bankrupt) return;
      const pos = this.positions[player.position];
      const cx = pos.x + this.tileSize / 2;
      const cy = pos.y + this.tileSize / 2 + 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = player.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 绘制中央信息区
    this.drawCenter(ctx, dice, logs, currentPlayerId, players);
  }

  drawTile(ctx, tile, x, y, w, h, playersMap) {
    // 背景色（地产使用其颜色，但抵押时变灰）
    let bgColor = this.getTileColor(tile);
    if (tile.mortgaged) {
      bgColor = '#aaa'; // 抵押状态灰色
    }
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // 所有者底部颜色条（使用玩家映射）
    if (tile.owner !== null) {
        const ownerColor = tile.ownerColor || playersMap[String(tile.owner)] || '#333';
        ctx.fillStyle = ownerColor;
        ctx.fillRect(x, y + h - 5, w, 5);
    }

    // 显示名称（自动分行）
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const lines = this.wrapText(ctx, tile.name, w - 4, 2); // 最多两行
    let lineY = y + 2;
    lines.forEach(line => {
      ctx.fillText(line, x + w / 2, lineY);
      lineY += 10;
    });

    // 显示价格/费用
    ctx.font = '9px Arial';
    ctx.textBaseline = 'top';
    if (tile.type === 'property' || tile.type === 'transport' || tile.type === 'utility') {
      ctx.fillStyle = '#000';
      ctx.fillText('$' + (tile.price || ''), x + w / 2, y + 22);
    } else if (tile.type === 'tax') {
      ctx.fillText('缴费', x + w / 2, y + 18);
      ctx.fillText('$' + tile.amount, x + w / 2, y + 28);
    } else if (tile.type === 'chance' || tile.type === 'destiny') {
      ctx.fillText(tile.type === 'chance' ? '机会' : '命运', x + w / 2, y + 20);
    }

    // 显示等级（自习室/宿舍图标）
    if (tile.type === 'property' && tile.level > 0) {
      this.drawLevelIcon(ctx, x + w - 10, y + 10, tile.level);
    }

    // 抵押状态显示“押”字
    if (tile.mortgaged) {
      ctx.fillStyle = 'rgba(255,0,0,0.7)';
      ctx.font = 'bold 20px Microsoft YaHei';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('押', x + w / 2, y + h / 2);
    }
  }

  // 绘制等级图标（简化：用数字+小图标表示，1-2自习室，3宿舍）
  drawLevelIcon(ctx, x, y, level) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 6, y - 6, 12, 12);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (level === 1) ctx.fillText('自', x, y);
    else if (level === 2) ctx.fillText('自2', x, y);
    else if (level === 3) ctx.fillText('宿', x, y);
  }

  // 自动换行
  wrapText(ctx, text, maxWidth, maxLines) {
    const chars = text.split('');
    const lines = [];
    let currentLine = '';
    for (let char of chars) {
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
        if (lines.length >= maxLines) break;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine && lines.length < maxLines) lines.push(currentLine);
    if (lines.length === 0) lines.push(text.substring(0, Math.floor(maxWidth / 10)));
    return lines;
  }

  getTileColor(tile) {
    switch(tile.type) {
      case 'start': return '#90EE90';
      case 'property': return tile.color || '#ddd';
      case 'chance': return '#FFDAB9';
      case 'destiny': return '#E6E6FA';
      case 'tax': return '#FFB6C1';
      case 'jail': return '#D3D3D3';
      case 'go_to_jail': return '#A9A9A9';
      case 'free': return '#F0E68C';
      case 'transport': return '#E0E0E0';
      case 'utility': return '#DCDCDC';
      default: return '#f0f0f0';
    }
  }

  // 绘制中央区域：骰子和事件日志
  drawCenter(ctx, dice, logs, currentPlayerId, players) {
    const cx = this.centerX;
    const cy = this.centerY;
    const boxWidth = 200;
    const boxHeight = 120;
    const x = cx - boxWidth / 2;
    const y = cy - boxHeight / 2;

    // 半透明背景
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(x, y, boxWidth, boxHeight);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    // 骰子区域
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`骰子: ${dice[0]} + ${dice[1]}`, cx, y + 5);

    // 分隔线
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 30);
    ctx.lineTo(x + boxWidth - 10, y + 30);
    ctx.stroke();

    // 事件日志（最多显示4条）
    ctx.font = '12px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const logLines = logs.slice(0, 4);
    logLines.forEach((log, i) => {
      ctx.fillText(log.message.substring(0, 20), x + 10, y + 35 + i * 20);
    });

    // 当前玩家指示（显示玩家名称）
    if (currentPlayerId) {
      const currentPlayer = players.find(p => p.id === currentPlayerId);
      const displayName = currentPlayer ? currentPlayer.name : currentPlayerId;
      ctx.fillStyle = '#555';
      ctx.font = 'bold 12px STKaiti';
      ctx.textAlign = 'center';
      ctx.fillText(`当前玩家: ${displayName}`, cx, y + boxHeight - 20);
    }
  }
}