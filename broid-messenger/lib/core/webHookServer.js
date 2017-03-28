"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const bodyParser = require("body-parser");
const express = require("express");
class WebHookServer {
    constructor(options, router, logLevel) {
        this.host = options.host;
        this.port = options.port;
        this.logger = new utils_1.Logger("webhook_server", logLevel || "info");
        this.setupExpress(router);
    }
    listen() {
        this.httpClient = this.express.listen(this.port, this.host, () => {
            this.logger.info(`Server listening on port ${this.host}:${this.port}...`);
        });
    }
    close() {
        return Promise.fromCallback((cb) => this.httpClient.close(cb));
    }
    setupExpress(router) {
        this.express = express();
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use("/", router);
    }
}
exports.default = WebHookServer;
