const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// 存储在线用户（昵称: 连接对象）
const users = new Map();

// 连接事件
wss.on('connection', (ws) => {
    // 生成匿名昵称（访客+时间戳）
    const nickname = `访客${Date.now().toString().slice(-4)}`;
    users.set(nickname, ws);
    
    // 广播用户加入消息
    broadcast({
        type: 'system',
        message: `${nickname} 加入聊天`,
        online: users.size,
        time: getCurrentTime()
    });

    // 监听消息
    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        // 验证消息格式
        if (message.content) {
            // 构建消息对象
            const msg = {
                type: 'message',
                nickname: nickname,
                content: message.content,
                time: getCurrentTime(),
                online: users.size
            };
            broadcast(msg);
        }
    });

    // 断开连接事件
    ws.on('close', () => {
        users.delete(nickname);
        broadcast({
            type: 'system',
            message: `${nickname} 离开聊天`,
            online: users.size,
            time: getCurrentTime()
        });
    });
});

// 广播消息给所有客户端
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// 获取北京时间（东八区）
function getCurrentTime() {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60 * 1000;
    const beijingTime = new Date(date.getTime() - offset + 8 * 60 * 60 * 1000);
    return beijingTime.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});