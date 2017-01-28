"use strict";
const bodyParser = require("body-parser");
const broid_utils_1 = require("broid-utils");
const express = require("express");
class WebHookServer {
    constructor(options, logLevel) {
        this.host = options && options.host || "127.0.0.1";
        this.port = options && options.port || 8080;
        this.logger = new broid_utils_1.Logger("webhook_server", logLevel || "info");
        this.express = express();
        this.middleware();
    }
    listen() {
        this.express.listen(this.port, this.host, () => {
            this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
        });
    }
    route(handler) {
        const router = express.Router();
        router.post("/", handler);
        this.express.use("/", router);
    }
    middleware() {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebHookServer;
