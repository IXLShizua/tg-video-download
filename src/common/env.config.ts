import env from 'env-var';
import { config } from 'dotenv';
import { resolve } from 'path';

config({
  path: resolve(process.cwd(), '.env'),
});

export const envConfig = {
  bot: {
    token: env.get('BOT_TOKEN').required().asString(),
  },
  telegramBotApi: {
    id: env.get('TELEGRAM_API_ID').required().asString(),
    hash: env.get('TELEGRAM_API_HASH').required().asString(),
  },
} as const;
