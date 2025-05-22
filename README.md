# SettldGPT Bot

This Telegram bot uses Supabase for authentication and data storage. Before running `poll.js` or `server.js`, create a `.env` file at the project root with the following variables:

```
SUPABASE_URL=<your Supabase project URL>
SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
TELEGRAM_TOKEN=<your Telegram bot token>
```

These values are required at startup. The bot will exit with an error if any are missing.
