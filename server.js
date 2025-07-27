const express = require('express');
const app = express();
app.use(express.json());

app.post('/', (req, res) => {
  console.log('LINE webhook received:', JSON.stringify(req.body));
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('This is a LINE Webhook endpoint');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
