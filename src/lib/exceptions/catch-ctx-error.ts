import { Context } from 'telegraf';
import { isAsyncFunction } from '#src/common/is-async-function';
import { BotException } from './bot-exception.js';

export function catchCtxError(
  fn: () => any | Promise<any>,
  ctx: Context<any>,
): void {
  if (isAsyncFunction(fn)) {
    fn().catch((error: unknown) => replyToCtxError(ctx, error));
  } else {
    try {
      fn();
    } catch (error: unknown) {
      replyToCtxError(ctx, error);
    }
  }
}

function replyToCtxError(ctx: Context<any>, error: any): void {
  if (error instanceof BotException) {
    return void ctx.replyWithHTML(`<b>${error.reason}</b> `);
  } else if (typeof error === 'string') {
    return void ctx.replyWithHTML(`<b>${error}</b>`);
  } else {
    return void ctx.replyWithHTML(`<b>Произошла непредвиденная ошибка.</b>`);
  }
}
