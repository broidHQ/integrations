"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pino = require("pino");
class Logger {
    constructor(name, level) {
        this.pino = pino({
            level,
            name,
        });
    }
    error(...messages) {
        messages.map((message) => this.pino.error(message));
    }
    warning(...messages) {
        messages.map((message) => this.pino.warn(message));
    }
    info(...messages) {
        messages.map((message) => this.pino.info(message));
    }
    debug(...messages) {
        messages.map((message) => this.pino.debug(message));
    }
}
exports.Logger = Logger;
