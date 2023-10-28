import { LogType } from './log-type.enum.js';
import { AnsiLoggerColors } from './logger-colors.enum.js';

type ClearedColorString =
  `${AnsiLoggerColors}${string}${AnsiLoggerColors.White}`;

type LoggerType = {
  [key in Lowercase<keyof typeof LogType>]: (...text: any[]) => void;
};

export class Logger implements LoggerType {
  constructor(private readonly prefix: string) {}

  info(...text: any[]): void {
    console.log(
      this.getLogPrefix(LogType.Info),
      ...text,
      AnsiLoggerColors.White,
    );
  }

  warn(...text: any[]): void {
    console.log(
      this.getLogPrefix(LogType.Warn),
      ...text,
      AnsiLoggerColors.White,
    );
  }

  error(...text: any[]): void {
    console.log(
      this.getLogPrefix(LogType.Error),
      ...text,
      AnsiLoggerColors.White,
    );
  }

  private getLogPrefix(type: LogType): string {
    const colorizedGlobalPrefix = this.getClearedColorPrefix(
      AnsiLoggerColors.Green,
      '[App]',
    );
    const formattedDate = new Date(Date.now())
      .toLocaleString('ru')
      .replaceAll(',', '');
    const colorizedPrefix = this.getClearedColorPrefix(
      AnsiLoggerColors.Yellow,
      `[${this.prefix}]`,
    );
    const colorizedLogType = this.getClearedColorPrefix(
      this.getLogTypeColor(type),
      `${type.padStart(5)}`,
    );
    const textColorPrefix = this.getLogTypeColor(type);

    return `${colorizedGlobalPrefix} - ${formattedDate}  ${colorizedLogType} ${colorizedPrefix}${textColorPrefix}`;
  }

  private getClearedColorPrefix(
    color: AnsiLoggerColors,
    text: string,
  ): ClearedColorString {
    return `${color}${text}${AnsiLoggerColors.White}`;
  }

  private getLogTypeColor(type: LogType): AnsiLoggerColors {
    switch (type) {
      case LogType.Info:
        return AnsiLoggerColors.Green;
      case LogType.Warn:
        return AnsiLoggerColors.Yellow;
      case LogType.Error:
        return AnsiLoggerColors.Red;
    }
  }
}

export const GlobalLogger = new Logger('Global');
