require('dotenv').config();
const { Bot } = require('grammy');
const { createClient } = require('@supabase/supabase-js');
const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Initialize Supabase with your Service Role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Telegram bot
const bot = new Bot(process.env.TELEGRAM_TOKEN);

// Helper to fetch a user's JWT from your mapping table

// /start — instructions
bot.command('start', ctx => {
  ctx.reply('👋 Send /email you@domain.com to log in.');
});

// /email — magic link flow
bot.command('email', async ctx => {
  const parts = ctx.message.text.split(' ');
  const email = parts[1];
  if (!email) {
    return ctx.reply('❗ Usage: /email you@domain.com');
  }
  console.log('⚙️ ANON_KEY →', process.env.SUPABASE_ANON_KEY);  const callbackUrl = 'http://localhost:3000/telegram-callback?chatId=' + ctx.from.id;
  const { error } = await supabaseAuth.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl }
  });
  if (error) {
    console.error('OTP error:', error);
    return ctx.reply('❌ Could not send magic link.');
  }
  ctx.reply('📧 Magic link sent! Check your email.');
});

// /tables — list all table names via Edge Function with user’s JWT
bot.command('tables', async ctx => {
  console.log('[LOG] /tables invoked by', ctx.from.id);

  // 1) Lookup stored JWT via helper
  const userJwt = await getUserJwt(ctx.from.id);
  console.log('🐛 [tables] row.jwt →', userJwt);
  if (!userJwt) {
    return ctx.reply('🔒 Please /start and /email to log in first.');
  }

  // 2) Call the Edge Function
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userJwt}`
  };

  const res = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/exec_sql`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sql_text: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
        sql_params: []
      })
    }
  );

  const payload = await res.json();
  if (!res.ok) {
    console.error('/tables error:', payload);
    return ctx.reply('❌ Error: ' + (payload.error || JSON.stringify(payload)));
  }

  // 3) Reply with results
  const names = payload.data.map(r => r.table_name).join(', ');
  ctx.reply('📋 Tables: ' + (names || 'none'));
});

// helper to look up the stored JWT via REST with both headers
async function getUserJwt(tgId) {
  const url = process.env.SUPABASE_URL
    + "/rest/v1/user_telegram?select=jwt&telegram_id=eq." + tgId;
  console.log("🐛 [getUserJwt] URL →", url);
  console.log("🐛 [getUserJwt] apikey →", process.env.SUPABASE_SERVICE_ROLE_KEY);
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
  const data = await res.json();
  if (!res.ok || !Array.isArray(data) || data.length === 0) {
    console.error("getUserJwt fetch error:", res.status, data);
    return null;
  }
  return data[0].jwt;
}

// helper to look up the stored JWT via REST with both headers
module.exports = bot;
