class Player {
  constructor(id, name, isAI = false) {
    this.id = id;               // 玩家唯一标识
    this.name = name;           // 显示名称
    this.cash = 15000;          // 初始资金
    this.position = 0;          // 当前位置索引
    this.properties = [];       // 拥有的地产索引数组
    this.isAI = isAI;           // 是否为 AI
    this.inJail = false;        // 是否在监狱
    this.jailTurns = 0;         // 已在监狱回合数
    this.bankrupt = false;      // 是否破产
  }
}