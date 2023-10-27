import { container, singleton } from 'tsyringe';
import { Telegraf } from 'telegraf';
import { resolve } from 'path';
import { readdir } from 'fs/promises';
import { ICommand } from '#lib/commands/command.interface';
import { catchCtxError } from '#lib/exceptions/catch-ctx-error';
import { Logger } from '#src/common/logger/logger';

@singleton()
export class CommandsHandler {
  private readonly logger = new Logger('CommandsHandler');

  async setupCommands(
    botInstance: Telegraf,
    commandsDir: string,
  ): Promise<void> {
    const commands = await this.buildCommands(commandsDir);

    for (const command of commands) {
      botInstance.command(command.COMMAND_NAME, (ctx) => {
        const bindedFn = command.execute.bind(command, ctx);

        catchCtxError(bindedFn, ctx);
      });
    }

    this.logger.info('All commands initialized.');
  }

  private async buildCommands(commandsDir: string): Promise<ICommand[]> {
    const rawFiles = await readdir(commandsDir, {
      recursive: true,
      withFileTypes: true,
    });

    return await Promise.all(
      rawFiles
        .filter((el) => !el.isDirectory() && el.name.endsWith('.command.js'))
        .map(async (el) => {
          const importedClass = await import(
            resolve(process.cwd(), commandsDir, el.name)
          );

          const className = Object.keys(importedClass)[0]!;

          return container.resolve(importedClass[className]);
        }),
    );
  }
}
