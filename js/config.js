// =============================================
// 浙大富翁 - 棋盘数据配置文件（紫金港校区主题）
// =============================================

// 棋盘数据：40个格子，按顺序排列（索引0~39）
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
  { type: 'go_to_jail', name: '骑电车不戴头盔被记 移动至[接受监督]！' },

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
  { type: 'property', name: '月牙楼', price: 3500, rent: 500, color: '#00008B' },
  // 38：税
  { type: 'tax', name: '缴住宿费', amount: 2000 },
  // 39：深蓝组 - 标志性建筑
  { type: 'property', name: '纳米楼', price: 4000, rent: 600, color: '#00008B' },
];

// =============================================
// 机会卡（校园卡）
// =============================================
const CHANCE_CARDS = [
  { text: '获得奖学金 500', effect: (player, game) => { player.cash += 500; } },
  { text: '拔他人充电器，罚款 100', effect: (player, game) => { player.cash -= 100; } },
  { text: '食堂免单，获得 200', effect: (player, game) => { player.cash += 200; } },
  { text: '前进到校门，领取 2000', effect: (player, game) => { 
      player.position = 0; 
      player.cash += 2000; 
      game.render(); 
  }},
  { text: '后退 3 步', effect: (player, game) => { 
      player.position = (player.position - 3 + BOARD_DATA.length) % BOARD_DATA.length; 
      game.render(); 
  }},
  { text: '捡到钱包交给保卫处，奖励 300', effect: (player, game) => { player.cash += 300; } },
  { text: '参加校园活动，获得纪念品奖励 150', effect: (player, game) => { player.cash += 150; } },
  { text: '电瓶车被拖走，罚款 200', effect: (player, game) => { player.cash -= 200; } },
  { text: '获得优秀学生干部奖金 800', effect: (player, game) => { player.cash += 800; } },
  { text: '买奶茶请客，花费 100', effect: (player, game) => { player.cash -= 100; } },
  { text: '前进到启真湖畔休息', effect: (player, game) => {
      player.position = 20; // 启真湖畔的索引
      game.render();
  }},
  { text: '直接前往校车总站', effect: (player, game) => {
      player.position = 5; // 校车总站索引
      game.render();
  }},
];

// =============================================
// 命运卡（考试周）
// =============================================
const DESTINY_CARDS = [
  { text: '考试作弊被抓，罚款 500', effect: (player, game) => { player.cash -= 500; } },
  { text: '绩点达标，奖励 300', effect: (player, game) => { player.cash += 300; } },
  { text: '实验室事故，损失 800', effect: (player, game) => { player.cash -= 800; } },
  { text: '直接送往监狱）', effect: (player, game) => { 
      player.position = 10; // 监狱索引
      player.inJail = true; 
      player.jailTurns = 0; 
      game.render(); 
  }},
  { text: '获得导师红包 400', effect: (player, game) => { player.cash += 400; } },
  { text: '通宵复习生病，医药费 300', effect: (player, game) => { player.cash -= 300; } },
  { text: '论文发表，奖励 1000', effect: (player, game) => { player.cash += 1000; } },
  { text: '错过上课，封口费 600', effect: (player, game) => { player.cash -= 600; } },
  { text: '获得国家奖学金 2000', effect: (player, game) => { player.cash += 2000; } },
  { text: '小组作业队友划水，多花时间损失 200', effect: (player, game) => { player.cash -= 200; } },
  { text: '退后到最近的地产', effect: (player, game) => {
      // 找到当前位置之前最近的地产格
      let pos = player.position;
      do {
        pos = (pos - 1 + BOARD_DATA.length) % BOARD_DATA.length;
      } while (BOARD_DATA[pos].type !== 'property');
      player.position = pos;
      game.render();
  }},
  { text: '前进到月牙楼', effect: (player, game) => {
      player.position = 37; // 月牙楼索引
      game.render();
  }},
];