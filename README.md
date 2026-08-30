# 浙大富翁

基于 Node.js 和 Socket.io 的多人在线大富翁游戏，主题为浙江大学紫金港校区。

## 功能
- 创建/加入房间，最多4名玩家联机对战
- 掷骰子、购买地产、建造自习室/宿舍、抵押赎回
- 机会卡、命运卡、监狱（实际上是骑电瓶车没带头盔被抓去监督啦！）、校车、公共事业等经典玩法
- 环形棋盘，实时显示骰子和事件日志

## 运行方法
1. 安装 [Node.js](https://nodejs.org/)
2. 克隆仓库：`git clone https://github.com/dysldyzx/zju-monopoly.git`
3. 进入目录：`cd zju-monopoly`
4. 安装依赖：`npm install`
5. 启动服务器：`node server.js`
6. 打开浏览器访问 `http://localhost:3000`

## 玩法说明
- 玩家轮流掷骰子，在地产上停留可购买，他人停留需支付租金
- 拥有同色组全部地产后可建造自习室，两间自习室可升级为宿舍提高租金
- 资金不足可抵押地产，赎回需支付额外利息
- 破产即退出，最后存活的玩家获胜

## 技术栈
- Node.js + Express
- Socket.io
- HTML5 Canvas