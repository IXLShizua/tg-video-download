import { singleton } from 'tsyringe';
import { Repository } from 'typeorm';
import { Input } from 'telegraf';
import { EventContext, IEvent } from '#lib/events/event.interface';
import { VideoDownloadService } from '#src/core/services/video-download/video-download.service';
import { VIDEO_URL_REGEX } from '#common/url.regex';
import { BotException } from '#lib/bot-exception';
import { FileEntity } from '#src/core/services/video-download/file.entity';
import { InjectRepository } from '#lib/database/inject-repository';

@singleton()
export class MessageEvent implements IEvent<'message'> {
  readonly EVENT_NAME = 'message';

  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    private readonly videoDownloadService: VideoDownloadService,
  ) {}

  async execute(ctx: EventContext<'message'>): Promise<any> {
    if ('text' in ctx.message && VIDEO_URL_REGEX.test(ctx.message.text)) {
      let url = ctx.message.text;

      if (
        url.startsWith('https://zen.yandex.ru/') ||
        url.startsWith('https://dzen.ru/')
      ) {
        url = await this.videoDownloadService.getZenManifestURL(url);
      }

      const existFile = await this.filesRepository.findOne({
        where: { url: ctx.message.text },
      });

      if (existFile) {
        return ctx.replyWithVideo(Input.fromFileId(existFile.file_id));
      }

      const video = await this.videoDownloadService
        .downloadVideoBuffer(ctx, url)
        .catch((e) => {
          throw e;
        });

      const fileId = await this.videoDownloadService
        .sendRequestWithVideoStream(ctx.message.chat.id, video.filename)
        .catch((e) => {
          throw e;
        });

      await this.filesRepository.save({
        url: ctx.message.text,
        file_id: fileId,
      });
    } else {
      throw new BotException('Отправьте правильную ссылку.');
    }
  }
}
