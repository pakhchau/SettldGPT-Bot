# SettldGPT Bot

This Telegram bot uses Supabase for authentication and data storage. Before running `poll.js` or `server.js`, create a `.env` file at the project root with the following variables:

```
SUPABASE_URL=<your Supabase project URL>
SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
TELEGRAM_TOKEN=<your Telegram bot token>
```

Make sure the values are not wrapped in quotes. Any leading or trailing quotes
or whitespace will be removed automatically at runtime, but providing the exact
tokens prevents connection errors such as "Invalid API key".

These values are required at startup. The bot will exit with an error if any are missing.

## Supabase Edge Function

Deploy the Edge Function in `supabase/functions/exec_sql` so the bot can execute SQL on behalf of the authenticated user. The `/tables` command calls this function with the user's JWT, and your Row Level Security policies are automatically enforced.
