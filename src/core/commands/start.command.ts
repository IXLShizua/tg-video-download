import { singleton } from 'tsyringe';
import { CommandContext, ICommand } from '#lib/commands/command.interface';

@singleton()
export class StartCommand implements ICommand {
  readonly COMMAND_NAME: string = 'start';

  execute(ctx: CommandContext): any {
    return ctx.replyWithHTML(
      '<b>Привет!</b> Я бот, умеющий скачивать любые видео из <b>YouTube, VK и Yandex Zen.</b>\n\n' +
        'Отправьте ссылку на видео, которое хотите скачать',
    );
  }
}
