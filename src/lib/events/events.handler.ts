import { container, singleton } from 'tsyringe';
import { Telegraf } from 'telegraf';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { IEvent } from '#lib/events/event.interface';
import { replyToCtxError } from '#lib/exceptions/reply-ctx-error';
import { isAsyncFunction } from '#common/is-async-function';

@singleton()
export class EventsHandler {
  async setupEvents(botInstance: Telegraf, eventsDir: string): Promise<void> {
    const events = await this.buildEvents(eventsDir);

    for (const event of events) {
      botInstance.on(event.EVENT_NAME, (ctx) => {
        const bindedFn = event.execute.bind(event, ctx);

        if (isAsyncFunction(bindedFn)) {
          bindedFn().catch((error: unknown) => replyToCtxError(ctx, error));
        } else {
          try {
            bindedFn();
          } catch (error: unknown) {
            replyToCtxError(ctx, error);
          }
        }
      });
    }
  }

  private async buildEvents(eventsDir: string): Promise<IEvent<any>[]> {
    const events = readdirSync(eventsDir)
      .filter((el) => el.endsWith('.event.js'))
      .map((el) => resolve(process.cwd(), eventsDir, el));

    const resolvedEvents: IEvent<any>[] = [];

    for (const event of events) {
      const importedClass = await import(event);
      const className = Object.keys(importedClass)[0]!;

      resolvedEvents.push(container.resolve(importedClass[className]));
    }

    return resolvedEvents;
  }
}
