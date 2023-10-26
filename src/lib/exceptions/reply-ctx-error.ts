import { Context } from 'telegraf';

export function replyToCtxError(ctx: Context<any>, error: any): void {
  if ('reason' in error) {
    return void ctx.replyWithHTML(`<b>Ошибка:</b> ${error.reason}`);
  } else if (typeof error === 'string') {
    return void ctx.replyWithHTML(`<b>Ошибка:</b> ${error}`);
  } else {
    return void ctx.replyWithHTML(`<b>Произошла непредвиденная ошибка.</b>`);
  }
}
