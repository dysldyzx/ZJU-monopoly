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
      } else if (i >= 1 && i <= 9) { // 底边（从右到左）
        x = this.margin + (sideLen + 1 - i) * step;
        y = this.margin + (sideLen + 1) * step;
      } else if (i === 10) { // 左下角
        x = this.margin;
        y = this.margin + (sideLen + 1) * step;
      } else if (i >= 11 && i <= 19) { // 左边（从下到上）
        x = this.margin;
        y = this.margin + (sideLen + 1 - (i - 10)) * step;
      } else if (i === 20) { // 左上角
        x = this.margin;
        y = this.margin;
      } else if (i >= 21 && i <= 29) { // 顶边（从左到右）
        x = this.margin + (i - 20) * step;
        y = this.margin;
      } else if (i === 30) { // 右上角
        x = this.margin + (sideLen + 1) * step;
        y = this.margin;
      } else if (i >= 31 && i <= 39) { // 右边（从上到下）
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

    // 所有者底部颜色条
    if (tile.owner !== null && tile.type !== 'start' && tile.type !== 'jail' && tile.type !== 'free') {
      // 优先使用 main.js 预映射的 ownerColor，fallback 到 playersMap，最后用深灰
      const ownerColor = (tile.ownerColor && tile.ownerColor !== 'null' && tile.ownerColor !== 'undefined')
        ? tile.ownerColor
        : (playersMap[String(tile.owner)] || '#333');
      ctx.fillStyle = ownerColor;
      ctx.fillRect(x, y + h - 5, w, 5);
    }

    // 绘制文字内容
    this.drawTileText(ctx, tile, x, y, w, h);

    // 显示等级（自习室/宿舍图标）
    if (tile.type === 'property' && tile.level > 0) {
      this.drawLevelIcon(ctx, x + w - 10, y + 10, tile.level);
    }

    // 抵押状态显示“押”字
    if (tile.mortgaged) {
      ctx.fillStyle = 'rgba(255,0,0,0.7)';
      ctx.font = 'bold 20px "PingFang SC", "SimHei", "Heiti SC", "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('押', x + w / 2, y + h / 2);
    }
  }

  // 绘制格子内文字（名称和价格）
  drawTileText(ctx, tile, x, y, w, h) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 设置字体（美观黑体，非微软雅黑）
    ctx.font = '12px "PingFang SC", "SimHei", "Heiti SC", "Noto Sans SC", sans-serif';

    // 名称自动换行，最多两行
    const maxTextWidth = w - 4;
    const nameLines = this.wrapText(ctx, tile.name, maxTextWidth, 2);
    // 名称起始 y：上方留 3px 空段（用户要求）
    let nameY = y + 3;
    ctx.fillStyle = '#000';
    nameLines.forEach(line => {
      ctx.fillText(line, x + w / 2, nameY);
      nameY += 14; // 行距：12px 字体 + 2px 间距
    });

    // 价格/费用信息（显示在名称下方，留出 3px 间隙）
    ctx.font = '10px "PingFang SC", "SimHei", "Heiti SC", "Noto Sans SC", sans-serif';
    ctx.fillStyle = '#000';
    let infoY = y + 3 + nameLines.length * 14 + 3; // 名称总高度 + 3px 间隙
    if (tile.type === 'property') {
      ctx.fillText('$' + tile.price, x + w / 2, infoY);
    } else if (tile.type === 'transport') {
      ctx.fillText('校车', x + w / 2, infoY);
      ctx.fillText('$' + tile.price, x + w / 2, infoY + 12);
    } else if (tile.type === 'utility') {
      ctx.fillText('公共', x + w / 2, infoY);
      ctx.fillText('$' + tile.price, x + w / 2, infoY + 12);
    } else if (tile.type === 'tax') {
      ctx.fillText('缴费', x + w / 2, infoY);
      ctx.fillText('$' + tile.amount, x + w / 2, infoY + 12);
    } else if (tile.type === 'chance' || tile.type === 'destiny') {
      ctx.fillText(tile.type === 'chance' ? '机会' : '命运', x + w / 2, infoY);
    }
  }

  // 绘制等级图标（简化：用数字+小图标表示，1-2自习室，3宿舍）
  drawLevelIcon(ctx, x, y, level) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 6, y - 6, 12, 12);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 9px "PingFang SC", "SimHei", "Heiti SC", "Noto Sans SC", sans-serif';
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
    if (lines.length === 0) lines.push(text.substring(0, Math.floor(maxWidth / 12)));
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
    ctx.font = 'bold 16px "PingFang SC", "SimHei", "Heiti SC", "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`骰子: ${dice[0]} + ${dice[1]}`, cx, y + 8);

    // 分隔线
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 32);
    ctx.lineTo(x + boxWidth - 10, y + 32);
    ctx.stroke();

    // 事件日志（最多显示4条）
    ctx.font = '12px "PingFang SC", "SimHei", "Heiti SC", "Noto Sans SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const logLines = logs.slice(0, 4);
    logLines.forEach((log, i) => {
      const msg = log.message.substring(0, 18); // 截取前18个字符，避免过长
      ctx.fillText(msg, x + 12, y + 38 + i * 18);
    });

    // 当前玩家指示（显示玩家名称）
    if (currentPlayerId) {
      const currentPlayer = players.find(p => p.id === currentPlayerId);
      const displayName = currentPlayer ? currentPlayer.name : currentPlayerId;
      ctx.fillStyle = '#555';
      ctx.font = 'bold 12px "PingFang SC", "SimHei", "Heiti SC", "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`当前玩家: ${displayName}`, cx, y + boxHeight - 22);
    }
  }
}