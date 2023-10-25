import { container, singleton } from 'tsyringe';
import { Telegraf } from 'telegraf';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { IEvent } from '#lib/events/event.interface';
import { BotException } from '#lib/bot-exception';

@singleton()
export class EventsHandler {
  async setupEvents(botInstance: Telegraf, eventsDir: string): Promise<void> {
    const events = await this.buildEvents(eventsDir);

    for (const event of events) {
      botInstance.on(event.EVENT_NAME, (ctx) => {
        event.execute
          .bind(event, ctx)()
          .catch((e) => {
            if (e instanceof BotException) {
              return void ctx.replyWithHTML(`<b>Ошибка:</b> ${e.reason}`);
            } else if (typeof e === 'string') {
              return void ctx.replyWithHTML(`<b>Ошибка:</b> ${e}`);
            } else {
              return void ctx.replyWithHTML(
                `<b>Произошла непредвиденная ошибка.</b>`,
              );
            }
          });
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
