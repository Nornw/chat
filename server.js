const WebSocket = require('ws');
const http = require('http');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// �洢�����û����ǳ�: ���Ӷ���
const users = new Map();

// �����¼�
wss.on('connection', (ws) => {
    // ���������ǳƣ��ÿ�+ʱ�����
    const nickname = `�ÿ�${Date.now().toString().slice(-4)}`;
    users.set(nickname, ws);
    
    // �㲥�û�������Ϣ
    broadcast({
        type: 'system',
        message: `${nickname} ��������`,
        online: users.size,
        time: getCurrentTime()
    });

    // ������Ϣ
    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        // ��֤��Ϣ��ʽ
        if (message.content) {
            // ������Ϣ����
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

    // �Ͽ������¼�
    ws.on('close', () => {
        users.delete(nickname);
        broadcast({
            type: 'system',
            message: `${nickname} �뿪����`,
            online: users.size,
            time: getCurrentTime()
        });
    });
});

// �㲥��Ϣ�����пͻ���
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// ��ȡ����ʱ�䣨��������
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

// ����������
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`������������ http://localhost:${PORT}`);
});