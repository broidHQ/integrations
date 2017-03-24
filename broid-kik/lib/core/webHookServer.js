"use strict";
const utils_1 = require("@broid/utils");
const http = require("http");
class WebHookServer {
    constructor(options, logLevel) {
        this.host = options && options.host || "127.0.0.1";
        this.port = options && options.port || 8080;
        this.logger = new utils_1.Logger("webhook_server", logLevel || "info");
    }
    listen(handler) {
        http.createServer(handler)
            .listen(this.port, this.host, () => {
            this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebHookServer;
