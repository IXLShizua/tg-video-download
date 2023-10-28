import { singleton } from 'tsyringe';
import { CommandContext, ICommand } from '#src/lib/commands/command.interface';
import { VideoDownloadService } from '#core/services/video-download/video-download.service';

@singleton()
export class CancelCommand implements ICommand {
  COMMAND_NAME: string = 'cancel';

  constructor(private readonly videoDownloadService: VideoDownloadService) {}

  execute(ctx: CommandContext): void {
    this.videoDownloadService.cancelDownload(ctx.message.from.username!);
  }
}
