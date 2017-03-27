"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
=======
const Promise = require("bluebird");
const bodyParser = require("body-parser");
>>>>>>> exposed-express-router
const utils_1 = require("@broid/utils");
const bodyParser = require("body-parser");
const express = require("express");
class WebHookServer {
<<<<<<< HEAD
    constructor(options, logLevel) {
        this.host = options && options.host || '127.0.0.1';
        this.port = options && options.port || 8080;
        this.logger = new utils_1.Logger('webhook_server', logLevel || 'info');
        this.express = express();
        this.middleware();
=======
    constructor(options, router, logLevel) {
        this.host = options.host;
        this.port = options.port;
        this.logger = new utils_1.Logger("webhook_server", logLevel || "info");
        this.setupExpress(router);
>>>>>>> exposed-express-router
    }
    listen() {
        this.httpClient = this.express.listen(this.port, this.host, () => {
            this.logger.info(`Server listening on port ${this.host}:${this.port}...`);
        });
    }
<<<<<<< HEAD
    route(handler) {
        const router = express.Router();
        router.post('/', handler);
        this.express.use('/', router);
=======
    close() {
        return Promise.fromCallback((cb) => this.httpClient.close(cb));
>>>>>>> exposed-express-router
    }
    setupExpress(router) {
        this.express = express();
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use("/", router);
    }
}
<<<<<<< HEAD
exports.WebHookServer = WebHookServer;
=======
exports.default = WebHookServer;
>>>>>>> exposed-express-router
