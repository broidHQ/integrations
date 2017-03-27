"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const bodyParser = require("body-parser");
<<<<<<< HEAD
=======
<<<<<<< HEAD
const broid_utils_1 = require("broid-utils");
=======
const utils_1 = require("@broid/utils");
>>>>>>> exposed-express-router
const crypto = require("crypto");
const events_1 = require("events");
>>>>>>> devel
const express = require("express");
const xmlParser = require("express-xml-bodyparser");
class WebHookServer {
    constructor(options, router, logLevel) {
        this.host = options.host;
        this.port = options.port;
<<<<<<< HEAD
        this.logger = new broid_utils_1.Logger("webhook_server", logLevel);
        this.setupExpress(router);
=======
        this.serviceID = serviceID;
        this.logger = new utils_1.Logger('webhook_server', logLevel);
        this.setupExpress();
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
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(xmlParser());
<<<<<<< HEAD
        this.router.get('/', (req, res) => {
            const shasum = crypto.createHash('sha1');
            shasum.update([this.serviceID, req.query.timestamp, req.query.nonce].sort().join(''));
            const signature = shasum.digest('hex');
            if (signature !== req.query.signature) {
                return res.status(500).end();
            }
            res.status(200).send(req.query.echostr);
        });
        this.router.post('/', (req, res) => {
            this.emit('message', req.body.xml);
            res.status(200).end();
        });
        this.express.use(this.router);
=======
        this.express.use(router);
>>>>>>> exposed-express-router
    }
}
exports.WebHookServer = WebHookServer;
