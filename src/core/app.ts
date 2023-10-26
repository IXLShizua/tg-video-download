import { singleton } from 'tsyringe';
import { Telegraf } from 'telegraf';
import { UserFromGetMe } from '@telegraf/types';
import { Database } from '#lib/database/database';
import { CommandsHandler } from '#lib/commands/commands.handler';
import { EventsHandler } from '#lib/events/events.handler';
import { envConfig } from '#common/env.config';

@singleton()
export class App {
  private readonly telegraf: Telegraf;
  private shutdownHooksEnabled: boolean = false;

  private startedSignal!: (botInfo: UserFromGetMe) => void;
  readonly started: Promise<UserFromGetMe> = new Promise((resolve) => {
    this.startedSignal = resolve;
  });

  constructor(
    private readonly database: Database,
    private readonly commandsHandler: CommandsHandler,
    private readonly eventsHandler: EventsHandler,
  ) {
    this.telegraf = new Telegraf(envConfig.bot.token);
  }

  async init(): Promise<this> {
    await this.database.init().then((db) => db.makeEntitiesInjectable());
    await Promise.all([
      this.commandsHandler.setupCommands(this.telegraf, './dist/core/commands'),
      this.eventsHandler.setupEvents(this.telegraf, './dist/core/events'),
    ]);

    this.startedSignal(await this.telegraf.telegram.getMe());

    this.telegraf.launch();

    return this;
  }

  enableShutdownHooks(): void {
    if (this.shutdownHooksEnabled) {
      throw new Error('Bot shutdown hooks already enabled.');
    }

    process.on('SIGINT', () => this.telegraf.stop('SIGINT'));
    process.on('SIGTERM', () => this.telegraf.stop('SIGTERM'));

    this.shutdownHooksEnabled = true;
  }
}
