import 'reflect-metadata';
import { container } from 'tsyringe';
import { Telegraf } from 'telegraf';
import { spawn } from 'child_process';
import { Database } from '#lib/database/database';
import { envConfig } from '#common/env.config';
import { EventsHandler } from '#lib/events/events.handler';
import { CommandsHandler } from '#lib/commands/commands.handler';
import { createStorage } from '#common/create-storage';
import { createDatabase } from '#common/create-database';

async function main(): Promise<void> {
  await createStorage();
  await createDatabase();

  await container
    .resolve(Database)
    .init()
    .then((db) => db.makeEntitiesInjectable());

  const bot = new Telegraf(envConfig.bot.token);

  container.register(Telegraf, { useValue: bot });

  await container
    .resolve(CommandsHandler)
    .setupCommands(bot, './dist/core/commands');
  await container.resolve(EventsHandler).setupEvents(bot, './dist/core/events');

  spawn('./telegram-bot-api', [
    '--api-id',
    envConfig.telegramBotApi.id,
    '--api-hash',
    envConfig.telegramBotApi.hash,
  ]);

  bot.telegram
    .getMe()
    .then((botInfo) =>
      console.log(`Bot started on https://t.me/${botInfo.username}`),
    );

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  await bot.launch();
}

void main();
