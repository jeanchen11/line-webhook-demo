const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// 回覆用函式
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

      // 如果收到的是文字訊息，且內容是 groupid，回傳群組 ID
      if (event.type === 'message' && event.message.type === 'text') {
        const text = event.message.text.trim().toLowerCase();

        if (text === 'groupid' && source.groupId) {
          await replyMessage(replyToken, `✅ 你的群組 ID 是：\n${source.groupId}`);
        } else if (text === 'userid' && source.userId) {
          await replyMessage(replyToken, `✅ 你的 user ID 是：\n${source.userId}`);
        }
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ webhook error:', err);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => {
  res.send('This is your LINE webhook endpoint 🚀');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ LINE Webhook server running on port ${port}`);
});
