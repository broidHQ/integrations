import * as pino from "pino";

export default class Logger {
  private pino: any;

  constructor(name, level) {
    this.pino = pino({
      level,
      name,
    });
  }

  public error(...messages) {
    messages.map((message) => this.pino.error(message));
  }

  public warning(...messages) {
    messages.map((message) => this.pino.warn(message));
  }

  public info(...messages) {
    messages.map((message) => this.pino.info(message));
  }

  public debug(...messages) {
    messages.map((message) => this.pino.debug(message));
  }
}
