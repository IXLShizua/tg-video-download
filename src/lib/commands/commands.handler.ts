import { container, singleton } from 'tsyringe';
import { Telegraf } from 'telegraf';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { ICommand } from '#lib/commands/command.interface';
import { replyToCtxError } from '#lib/exceptions/reply-ctx-error';
import { isAsyncFunction } from '#common/is-async-function';

@singleton()
export class CommandsHandler {
  async setupCommands(
    botInstance: Telegraf,
    commandsDir: string,
  ): Promise<void> {
    const commands = await this.buildCommands(commandsDir);

    for (const command of commands) {
      botInstance.command(command.COMMAND_NAME, (ctx) => {
        const bindedFn = command.execute.bind(command, ctx);

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

  private async buildCommands(commandsDir: string): Promise<ICommand[]> {
    const commands = readdirSync(commandsDir)
      .filter((el) => el.endsWith('.command.js'))
      .map((el) => resolve(process.cwd(), commandsDir, el));

    const resolvedCommands: ICommand[] = [];

    for (const command of commands) {
      const importedClass = await import(command);
      const className = Object.keys(importedClass)[0]!;

      resolvedCommands.push(container.resolve(importedClass[className]));
    }

    return resolvedCommands;
  }
}
