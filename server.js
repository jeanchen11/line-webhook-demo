const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// 從環境變數讀取 LINE Token（Render 環境變數設定中）
const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// LINE 回覆訊息的函式
function replyMessage(replyToken, message) {
  return axios.post(
    'https://api.line.me/v2/bot/message/reply',
    {
      replyToken: replyToken,
      messages: [{ type: 'text', text: message }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
    }
  );
}

// webhook 接收端點
app.post('/', async (req, res) => {
  try {
    const events = req.body.events;

    for (const event of events) {
      const replyToken = event.replyToken;
      const source = event.source;
      const type = source.type;

      console.log('📥 收到 LINE webhook：');
      console.log('類型:', type);
      console.log('userId:', source.userId);
      if (source.groupId) console.log('groupId:', source.groupId);
      if (source.roomId) console.log('roomId:', source.roomId);

      // 處理文字訊息
      if (event.type === 'message' && event.message.type === 'text') {
        const text = event.message.text.trim().toLowerCase();

        if (text === 'groupid' && source.groupId) {
          await replyMessage(replyToken, `✅ 你的群組 ID 是：\n${source.groupId}`);
        } else if (text === 'roomid' && source.roomId) {
          await replyMessage(replyToken, `✅ 你的 room ID 是：\n${source.roomId}`);
        } else if (text === 'userid' && source.userId) {
          await replyMessage(replyToken, `✅ 你的 user ID 是：\n${source.userId}`);
        } else {
          await replyMessage(replyToken, '📌 傳送以下文字可取得對應資訊：\n- groupid\n- roomid\n- userid');
        }
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ webhook error:', err);
    res.sendStatus(500);
  }
});

// 測試首頁
app.get('/', (req, res) => {
  res.send('✅ This is your LINE webhook endpoint!');
});

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ LINE Webhook server running on port ${port}`);
});
