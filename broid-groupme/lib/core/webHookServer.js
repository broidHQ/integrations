"use strict";
const bodyParser = require("body-parser");
const broid_utils_1 = require("broid-utils");
const EventEmitter = require("events");
const express = require("express");
const R = require("ramda");
class WebHookServer extends EventEmitter {
    constructor(username, options, logLevel) {
        super();
        this.username = username;
        this.host = options && options.host || "127.0.0.1";
        this.port = options && options.port || 8080;
        this.logger = new broid_utils_1.Logger("webhook_server", logLevel || "info");
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
            if (!R.path(["body", "system"], req) && this.username !== R.path(["body", "name"], req)) {
                this.emit("message", {
                    body: req.body,
                    headers: req.headers,
                });
            }
            res.sendStatus(200);
        };
        router.get("/", handle);
        router.post("/", handle);
        this.express.use("/", router);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebHookServer;
