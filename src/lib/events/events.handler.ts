import { container, singleton } from 'tsyringe';
import { Telegraf } from 'telegraf';
import { resolve } from 'path';
import { readdir } from 'fs/promises';
import { IEvent } from '#lib/events/event.interface';
import { catchCtxError } from '#lib/exceptions/catch-ctx-error';
import { Logger } from '#src/common/logger/logger';

@singleton()
export class EventsHandler {
  private readonly logger = new Logger('EventsHandler');

  async setupEvents(botInstance: Telegraf, eventsDir: string): Promise<void> {
    const events = await this.buildEvents(eventsDir);

    for (const event of events) {
      botInstance.on(event.EVENT_NAME, (ctx) => {
        const bindedFn = event.execute.bind(event, ctx);

        catchCtxError(bindedFn, ctx);
      });
    }

    this.logger.info('All events initialized.');
  }

  private async buildEvents(eventsDir: string): Promise<IEvent<any>[]> {
    const rawFiles = await readdir(eventsDir, {
      recursive: true,
      withFileTypes: true,
    });

    return await Promise.all(
      rawFiles
        .filter((el) => !el.isDirectory() && el.name.endsWith('.event.js'))
        .map(async (el) => {
          const importedClass = await import(
            resolve(process.cwd(), eventsDir, el.name)
          );

          const className = Object.keys(importedClass)[0]!;

          return container.resolve(importedClass[className]);
        }),
    );
  }
}
