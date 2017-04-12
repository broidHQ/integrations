import * as pino from 'pino';

export class Logger {
  private pino: any;

  constructor(name: string, level: string) {
    this.pino = pino({
      level,
      name,
    });
  }

  public error(...messages: any[]) {
    messages.map((message: any) => this.pino.error(message));
  }

  public warning(...messages: any[]) {
    messages.map((message: any) => this.pino.warn(message));
  }

  public info(...messages: any[]) {
    messages.map((message: any) => this.pino.info(message));
  }

  public debug(...messages: any[]) {
    messages.map((message: any) => this.pino.debug(message));
  }
}
