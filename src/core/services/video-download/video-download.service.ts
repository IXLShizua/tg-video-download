import { singleton } from 'tsyringe';
import FormData from 'form-data';
import { got } from 'got';
import { Buffer } from 'buffer';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as fs from 'fs';
import { rm } from 'fs/promises';
import { envConfig } from '#common/env.config';
import { EventContext } from '#lib/events/event.interface';

@singleton()
export class VideoDownloadService {
  private readonly requestsToDownload: Set<string> = new Set<string>();

  downloadVideoBuffer(
    ctx: EventContext<'message'>,
    url: string,
  ): Promise<{ filename: string }> {
    return new Promise<{ filename: string }>(async (resolve, reject) => {
      const username = ctx.message.from.username!;

      if (this.requestsToDownload.has(username)) {
        return reject('Ваш запрос уже находится в обработке.');
      } else {
        this.requestsToDownload.add(username);
      }

      const firstMessageInfo = await ctx.reply(
        'Ваш запрос добавлен в очередь. Ожидайте.',
      );

      const ytDlpProcess = this.spawnYtDlpProcess(url);

      const filename = `./storage/${username}-${Date.now()}`;
      const writable = fs.createWriteStream(filename);

      ytDlpProcess.stdout.pipe(writable);

      ytDlpProcess.stderr.on('data', async (data: Buffer) => {
        const decodedData = data.toString();

        if (decodedData.includes('does not pass filter (!is_live)')) {
          return reject(
            'Скачивание стримов (прямых трансляций) не поддерживается.',
          );
        }

        if (decodedData.includes('Unsupported URL')) {
          return reject('Этот URL неверный или не поддерживается.');
        }
      });

      ytDlpProcess.on('close', async (code) => {
        if (code === 0) {
          resolve({ filename });
        } else {
          reject('Произошла ошибка при обработке данного видео.');
        }

        this.requestsToDownload.delete(username);
        await ctx.deleteMessage(firstMessageInfo.message_id);
      });
    });
  }

  async getZenManifestURL(videoURL: string): Promise<string> {
    const videoPageResponse = await fetch(videoURL, { method: 'POST' });
    const videoPageBody = await videoPageResponse.text();

    const buildedURLArr: string[] = [];

    let mpdFileURLIndex = videoPageBody.indexOf('manifest.mpd');
    let mpdFileURLIndexSecond = mpdFileURLIndex + 1;

    let currentSymbolFirst: string = '';
    let currentSymbolSecond: string = '';

    while (videoPageBody[mpdFileURLIndex] !== '"') {
      currentSymbolFirst = videoPageBody[mpdFileURLIndex]!;

      buildedURLArr.unshift(currentSymbolFirst);
      mpdFileURLIndex--;
    }

    while (videoPageBody[mpdFileURLIndexSecond] !== '"') {
      currentSymbolSecond = videoPageBody[mpdFileURLIndexSecond]!;

      buildedURLArr.push(currentSymbolSecond);
      mpdFileURLIndexSecond++;
    }

    return buildedURLArr.join('');
  }

  async sendRequestWithVideoStream(
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
      .json()
      .then((data) => {
        rm(filename);

        return data;
      })) as { result: { video: { file_id: string } } };

    return res?.result?.video?.file_id;
  }

  private spawnYtDlpProcess(url: string): ChildProcessWithoutNullStreams {
    return spawn('yt-dlp', [
      url,
      '-o',
      '-',
      '--no-playlist',
      '--abort-on-error',
      '--max-filesize',
      '1999M',
      '--verbose',
      '--quiet',
      '--progress',
      '--match-filter',
      '!is_live',
    ]);
  }
}
