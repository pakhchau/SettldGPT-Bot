require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const { Bot } = require('grammy');
const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// load env
const bot = new Bot(process.env.TELEGRAM_TOKEN);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// reuse your existing bot handlers
require('./bot'); // assumes bot.js defines and starts `bot`

const app = express();
app.use(bodyParser.json());
app.use(express.static(process.cwd())); // serve callback.html

// callback page
app.get('/telegram-callback', (_req, res) => {
  res.sendFile(path.join(__dirname, 'callback.html'));
});

// receive token + chatId
app.post('/api/telegram/save-token', async (req, res) => {
  console.log('Callback payload:', req.body);
  const { chatId, token } = req.body;
  const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser(token);
  if (userErr || !user) { console.error("Error validating JWT:", userErr); return res.status(401).send("Invalid token"); }  await supabase
    .from('user_telegram')
    .upsert({ user_id: user.id, telegram_id: parseInt(chatId,10) });
  await bot.api.sendMessage(chatId, '✅ You’re now logged in!');
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Callback server up on port', PORT));
