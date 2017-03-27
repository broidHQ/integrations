"use strict";
const Promise = require("bluebird");
const bodyParser = require("body-parser");
const utils_1 = require("@broid/utils");
const EventEmitter = require("events");
const express = require("express");
class WebHookServer extends EventEmitter {
    constructor(router, options, logLevel) {
        super();
<<<<<<< HEAD
        this.host = options.host;
        this.port = options.port;
        this.logger = new broid_utils_1.Logger("webhook_server", logLevel || "info");
        this.express = this.setupExpress(router);
=======
        this.host = options && options.host || "127.0.0.1";
        this.port = options && options.port || 8080;
        this.logger = new utils_1.Logger("webhook_server", logLevel || "info");
        this.express = express();
        this.middleware();
        this.routes();
>>>>>>> devel
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebHookServer;
