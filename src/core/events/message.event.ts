import { singleton } from 'tsyringe';
import { EventContext, IEvent } from '#lib/events/event.interface';
import { BotException } from '#lib/exceptions/bot-exception';
import { VideoDownloadService } from '#core/services/video-download/video-download.service';
import { VIDEO_URL_REGEX } from '#common/url.regex';

@singleton()
export class MessageEvent implements IEvent<'message'> {
  readonly EVENT_NAME = 'message';

  constructor(private readonly videoDownloadService: VideoDownloadService) {}

  async execute(ctx: EventContext<'message'>): Promise<any> {
    if ('text' in ctx.message && VIDEO_URL_REGEX.test(ctx.message.text)) {
      await this.videoDownloadService.downloadVideo(ctx, ctx.message.text);
    } else {
      throw new BotException('Отправьте правильную ссылку.');
    }
  }
}
