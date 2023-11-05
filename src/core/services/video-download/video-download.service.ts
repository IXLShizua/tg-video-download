import { singleton } from 'tsyringe';
import FormData from 'form-data';
import { got } from 'got';
import { Input } from 'telegraf';
import { Repository } from 'typeorm';
import { Buffer } from 'buffer';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as fs from 'fs';
import { rm } from 'fs/promises';
import { resolve } from 'path';
import * as process from 'process';
import { envConfig } from '#common/env.config';
import { EventContext } from '#lib/events/event.interface';
import { BotException } from '#src/lib/exceptions/bot-exception';
import { InjectRepository } from '#src/lib/database/inject-repository';
import { FileEntity } from './file.entity.js';

@singleton()
export class VideoDownloadService {
  private readonly requestsToDownload: Map<string, AbortController> = new Map<
    string,
    AbortController
  >();

  constructor(
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
  ) {}

  async downloadVideo(
    ctx: EventContext<'message'>,
    url: string,
  ): Promise<void> {
    const existFile = await this.filesRepository.findOne({
      where: { url: ctx.message.text },
    });

    if (existFile) {
      return ctx.replyWithVideo(Input.fromFileId(existFile.file_id));
    }

    const video = await this.downloadVideoBuffer(ctx, url);

    const fileId = await this.sendRequestWithVideoStream(
      ctx.message.chat.id,
      video.filename,
    );

    await this.filesRepository.save({
      url: ctx.message.text,
      file_id: fileId,
    });
  }

  cancelDownload(username: string): void {
    const request = this.requestsToDownload.get(username);

    if (!request) {
      throw new BotException('У Вас нет активных запросов на скачивание.');
    }

    request.abort('AbortDownload');
  }

  private downloadVideoBuffer(
    ctx: EventContext<'message'>,
    url: string,
  ): Promise<{ filename: string }> {
    return new Promise<{ filename: string }>(async (resolve, reject) => {
      const username = ctx.message.from.username!;

      let abortController: AbortController;

      if (this.requestsToDownload.has(username)) {
        return reject(
          new BotException('Ваш запрос уже находится в обработке.'),
        );
      } else {
        abortController = new AbortController();

        this.requestsToDownload.set(username, abortController);
      }

      const firstMessageInfo = await ctx.reply(
        'Ваш запрос добавлен в очередь. Ожидайте.',
      );

      const ytDlp = this.spawnYtDlpProcess(url, abortController.signal);

      const filename = `./storage/${username}-${Date.now()}`;
      const writable = fs.createWriteStream(filename);

      ytDlp.stdout.pipe(writable);

      ytDlp.on('error', (err) => {
        if (err.cause !== 'AbortDownload') {
          throw err;
        }
      });

      ytDlp.stderr.on('data', (data: Buffer) => {
        const decodedData = data.toString();

        if (decodedData.includes('does not pass filter (!is_live)')) {
          return reject(
            new BotException(
              'Скачивание стримов (прямых трансляций) не поддерживается.',
            ),
          );
        }

        if (decodedData.includes('Unsupported URL')) {
          return reject(
            new BotException('Этот URL неверный или не поддерживается.'),
          );
        }
      });

      ytDlp.on('close', (code, signal) => {
        if (code === 0) {
          resolve({ filename });
        } else if (code === null && signal === 'SIGTERM' && ytDlp.killed) {
          reject(new BotException('Загрузка видео успешно отменена.'));
        } else {
          reject(
            new BotException('Произошла ошибка при обработке данного видео.'),
          );
        }

        rm(filename).catch(() => {});
        this.requestsToDownload.delete(username);
        ctx.deleteMessage(firstMessageInfo.message_id);
      });
    });
  }

  private async sendRequestWithVideoStream(
    chatId: string,
    filename: string,
  ): Promise<string> {
    const formData = new FormData();

    formData.append('chat_id', chatId);
    formData.append('supports_streaming', 'true');
    formData.append('video', fs.createReadStream(filename), {
      filename: 'video.mp4',
    });

    const res = (await got
      .post(`http://127.0.0.1:8081/bot${envConfig.bot.token}/sendVideo`, {
        body: formData,
        headers: formData.getHeaders(),
      })
      .json()) as { result: { video: { file_id: string } } };

    return res?.result?.video?.file_id;
  }

  private spawnYtDlpProcess(
    url: string,
    abortSignal: AbortSignal,
  ): ChildProcessWithoutNullStreams {
    return spawn(
      resolve(process.cwd(), 'bins', 'yt-dlp'),
      [
        url,
        '-o',
        '-',
        '--no-playlist',
        '--abort-on-error',
        '--max-filesize',
        '1999M',
        '--quiet',
        '--progress',
        '--match-filter',
        '!is_live',
      ],
      {
        signal: abortSignal,
      },
    );
  }
}
