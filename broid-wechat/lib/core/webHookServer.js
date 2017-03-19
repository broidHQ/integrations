"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const bodyParser = require("body-parser");
const broid_utils_1 = require("broid-utils");
const express = require("express");
const xmlParser = require("express-xml-bodyparser");
class WebHookServer {
    constructor(options, router, logLevel) {
        this.host = options.host;
        this.port = options.port;
        this.logger = new broid_utils_1.Logger("webhook_server", logLevel);
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
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(xmlParser());
        this.express.use(router);
    }
}
exports.default = WebHookServer;
