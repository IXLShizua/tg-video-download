import 'reflect-metadata';
import { container } from 'tsyringe';
import { spawn } from 'child_process';
import { App } from '#core/app';
import { envConfig } from '#common/env.config';
import { createStorage } from '#common/create-storage';
import { createDatabase } from '#common/create-database';
import { GlobalLogger } from '#common/logger/logger';

async function main(): Promise<void> {
  await createStorage();
  await createDatabase();

  const app = container.resolve(App);

  await app.init();
  app.enableShutdownHooks();

  await app.started.then((botInfo) =>
    GlobalLogger.info(`Bot started on https://t.me/${botInfo.username}.`),
  );

  spawn('./bins/telegram-bot-api', [
    '--api-id',
    envConfig.telegramBotApi.id,
    '--api-hash',
    envConfig.telegramBotApi.hash,
  ]).on('error', (err) => {
    GlobalLogger.error(err);
    process.exit(1);
  });
}

void main();
