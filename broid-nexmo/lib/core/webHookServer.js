"use strict";
<<<<<<< HEAD
Object.defineProperty(exports, "__esModule", { value: true });
=======
const Promise = require("bluebird");
const bodyParser = require("body-parser");
>>>>>>> exposed-express-router
const utils_1 = require("@broid/utils");
const bodyParser = require("body-parser");
const EventEmitter = require("events");
const express = require("express");
class WebHookServer extends EventEmitter {
    constructor(router, options, logLevel) {
        super();
<<<<<<< HEAD
        this.host = options && options.host || '127.0.0.1';
=======
<<<<<<< HEAD
        this.host = options.host;
        this.port = options.port;
        this.logger = new broid_utils_1.Logger("webhook_server", logLevel || "info");
        this.express = this.setupExpress(router);
=======
        this.host = options && options.host || "127.0.0.1";
>>>>>>> exposed-express-router
        this.port = options && options.port || 8080;
        this.logger = new utils_1.Logger('webhook_server', logLevel || 'info');
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
<<<<<<< HEAD
    }
    routes() {
        const router = express.Router();
        const handle = (req, res) => {
            let query = {};
            if (req.method === 'GET') {
                query = req.query;
            }
            else if (req.method === 'POST') {
                query = req.body;
            }
            const message = {
                keyword: query.keyword,
                messageId: query.messageId,
                msisdn: query.msisdn,
                text: query.text,
                timestamp: query['message-timestamp'],
                to: query.to,
            };
            this.emit('message', message);
            res.sendStatus(200);
        };
        router.get('/', handle);
        router.post('/', handle);
        this.express.use('/', router);
=======
        this.express.use("/", router);
>>>>>>> exposed-express-router
    }
}
exports.WebHookServer = WebHookServer;
