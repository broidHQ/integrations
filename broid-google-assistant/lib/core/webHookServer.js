"use strict";
const actionsSdk = require("actions-on-google");
const Promise = require("bluebird");
const bodyParser = require("body-parser");
const broid_utils_1 = require("broid-utils");
const events_1 = require("events");
const express = require("express");
class WebHookServer extends events_1.EventEmitter {
    constructor(options, logLevel) {
        super();
        this.actionsMap = new Map();
        this.host = options && options.host || "127.0.0.1";
        this.port = options && options.port || 8080;
        this.logger = new broid_utils_1.Logger("webhook_server", logLevel || "info");
        this.express = express();
        this.middleware();
        this.routes();
    }
    addIntent(trigger) {
        this.actionsMap.set(trigger, () => {
            const body = this.assistant.body_;
            const conversationId = this.assistant.getConversationId();
            let deviceLocation = null;
            const intent = this.assistant.getIntent();
            const user = this.assistant.getUser();
            const userInput = this.assistant.getRawInput();
            if (this.assistant.isPermissionGranted()) {
                deviceLocation = this.assistant.getDeviceLocation();
            }
            this.emit(trigger, {
                body,
                conversationId,
                deviceLocation,
                intent,
                user,
                userInput,
            });
        });
    }
    listen() {
        this.express.listen(this.port, this.host, () => {
            this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
        });
    }
    send(isSSML, content, noInputs) {
        const inputPrompt = this.assistant
            .buildInputPrompt(isSSML, content, noInputs);
        this.assistant.ask(inputPrompt);
        return Promise.resolve(true);
    }
    middleware() {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }
    routes() {
        const router = express.Router();
        router.post("/", (req, res) => {
            this.assistant = new actionsSdk
                .ActionsSdkAssistant({ request: req, response: res });
            this.assistant.handleRequest(this.actionsMap);
        });
        this.express.use("/", router);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WebHookServer;
