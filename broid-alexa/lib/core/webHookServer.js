"use strict";
const bodyParser = require("body-parser");
const utils_1 = require("@broid/utils");
const EventEmitter = require("events");
const express = require("express");
const uuid = require("node-uuid");
const R = require("ramda");
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
            const request = req.body.request;
            const session = req.body.session;
            const requestType = request.type;
            const intentName = requestType === "IntentRequest"
                ? R.path(["intent", "name"], request) : requestType;
            const messageID = uuid.v4();
            const message = {
                application: session.application,
                intentName,
                messageID,
                requestType,
                slots: R.path(["intent", "slots"], request) || {},
                user: session.user,
            };
            const responseListener = (data) => res.json(data);
            this.emit("message", message);
            this.once(`response:${messageID}`, responseListener);
            setTimeout(() => this.removeListener(`response:${messageID}`, responseListener), 60000);
        };
        router.get("/", handle);
        router.post("/", handle);
        this.express.use("/", router);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebHookServer;
