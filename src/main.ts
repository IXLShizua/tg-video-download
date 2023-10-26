import 'reflect-metadata';
import { container } from 'tsyringe';
import { spawn } from 'child_process';
import { envConfig } from '#common/env.config';
import { createStorage } from '#common/create-storage';
import { createDatabase } from '#common/create-database';
import { App } from '#src/core/app';

async function main(): Promise<void> {
  await createStorage();
  await createDatabase();

  const app = container.resolve(App);

  await app.init();
  app.enableShutdownHooks();

  await app.started.then((botInfo) =>
    console.log(`Bot started on https://t.me/${botInfo.username}`),
  );

  spawn('./telegram-bot-api', [
    '--api-id',
    envConfig.telegramBotApi.id,
    '--api-hash',
    envConfig.telegramBotApi.hash,
  ]);
}

void main();
