import { Context } from 'telegraf';
import { Message, Update } from '@telegraf/types';

export type CommandContext = Context<Update.MessageUpdate<Message.TextMessage>>;

export interface ICommand {
  readonly COMMAND_NAME: string;

  execute(ctx: CommandContext): Promise<any>;
}
