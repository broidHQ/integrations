"use strict";
const bodyParser = require("body-parser");
const utils_1 = require("@broid/utils");
const EventEmitter = require("events");
const express = require("express");
class WebHookServer extends EventEmitter {
    constructor(options, logLevel) {
        super();
        this.host = options && options.host || "127.0.0.1";
        this.port = options && options.port || 8080;
        this.logger = new utils_1.Logger("webhook_server", logLevel || "info");
        this.express = express();
        this.middleware();
        this.routes();
    }
    listen() {
        this.express.listen(this.port, this.host, () => {
            this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
        });
    }
    middleware() {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }
    routes() {
        const router = express.Router();
        const handle = (req, res) => {
            let query = {};
            if (req.method === "GET") {
                query = req.query;
            }
            else if (req.method === "POST") {
                query = req.body;
            }
            const message = {
                keyword: query.keyword,
                messageId: query.messageId,
                msisdn: query.msisdn,
                text: query.text,
                timestamp: query["message-timestamp"],
                to: query.to,
            };
            this.emit("message", message);
            res.sendStatus(200);
        };
        router.get("/", handle);
        router.post("/", handle);
        this.express.use("/", router);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebHookServer;
