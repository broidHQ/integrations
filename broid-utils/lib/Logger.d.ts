export declare class Logger {
    private pino;
    constructor(name: string, level: string);
    error(...messages: any[]): void;
    warning(...messages: any[]): void;
    info(...messages: any[]): void;
    debug(...messages: any[]): void;
}
