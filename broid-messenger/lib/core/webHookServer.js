"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const broid_utils_1 = require("broid-utils");
const events_1 = require("events");
const express = require("express");
class WebHookServer extends events_1.EventEmitter {
    constructor(tokenSecret, options, logLevel) {
        super();
        this.host = options && options.host || "127.0.0.1";
        this.port = options && options.port || 8080;
        this.tokenSecret = tokenSecret || "";
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
        router.get("/", (req, res) => {
            if (req.query["hub.mode"] === "subscribe") {
                if (req.query["hub.verify_token"] === this.tokenSecret) {
                    res.send(req.query["hub.challenge"]);
                }
                else {
                    res.send("OK");
                }
            }
        });
        router.post("/", (req, res) => {
            const event = {
                request: req,
                response: res,
            };
            this.emit("message", event);
            res.sendStatus(200);
        });
        this.express.use("/", router);
    }
}
exports.default = WebHookServer;
