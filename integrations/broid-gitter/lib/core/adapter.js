"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const events_1 = require("events");
const Gitter = require("node-gitter");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const parser_1 = require("./parser");
const eventNames = ["chatMessages"];
const roomToInfos = (room) => ({
    id: room.id,
    name: room.name,
    oneToOne: room.oneToOne,
    uri: room.uri,
    url: room.url,
});
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || null;
        this.ee = new events_1.EventEmitter();
        this.parser = new parser_1.default(this.serviceID, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
    }
    users() {
        return Promise.reject(new Error("Not supported"));
    }
    channels() {
        return new Promise((resolve, reject) => {
            return this.session.rooms.findAll()
                .then(resolve)
                .catch(reject);
        })
            .map(roomToInfos);
    }
    serviceId() {
        return this.serviceID;
    }
    connect() {
        if (!this.token || this.token === "") {
            return Rx_1.Observable.throw(new Error("Token should exist."));
        }
        this.session = new Gitter(this.token);
        const handler = (room, eventName) => {
            return (data) => {
                if (data.operation === "create"
                    && this.me.username !== R.path(["model", "fromUser", "username"], data)) {
                    return this.ee.emit(eventName, {
                        data: data.model,
                        room: roomToInfos(room),
                    });
                }
                return null;
            };
        };
        const currentUser = new Promise((resolve, reject) => this.session.currentUser()
            .then(resolve)
            .catch(reject));
        const connect = currentUser
            .tap((user) => this.me = user)
            .then(() => this.channels())
            .map((room) => this.joinRoom(room))
            .map((room) => {
            room.subscribe();
            R.forEach((eventName) => room.on(eventName, handler(room, eventName)), eventNames);
            return room;
        });
        return Rx_1.Observable.fromPromise(connect)
            .map(() => ({ type: "connected", serviceID: this.serviceId() }));
    }
    disconnect() {
        return Promise.reject(new Error("Not supported"));
    }
    listen() {
        if (!this.session) {
            return Rx_1.Observable.throw(new Error("No session found."));
        }
        const fromEvents = R.map((eventName) => Rx_1.Observable.fromEvent(this.ee, eventName), eventNames);
        return Rx_1.Observable.merge(...fromEvents)
            .mergeMap((normalized) => this.parser.parse(normalized))
            .mergeMap((parsed) => this.parser.validate(parsed))
            .mergeMap((validated) => {
            if (!validated) {
                return Rx_1.Observable.empty();
            }
            return Promise.resolve(validated);
        });
    }
    send(data) {
        this.logger.debug("sending", { message: data });
        return broid_schemas_1.default(data, "send")
            .then(() => {
            if (data.object.type !== "Note") {
                return Promise.reject(new Error("Only Note is supported."));
            }
            return Promise.resolve(data)
                .then((result) => {
                const roomID = R.path(["to", "id"], result);
                return this.channels()
                    .filter((room) => room.id === roomID)
                    .then((rooms) => {
                    if (R.length(rooms) === 0) {
                        throw new Error(`${roomID} not found.`);
                    }
                    return this.joinRoom(rooms[0])
                        .then((room) => [result, room]);
                });
            })
                .spread((result, room) => {
                const content = R.path(["object", "content"], result);
                const contentID = R.path(["object", "id"], result);
                if (contentID) {
                    return this.session.client.put(`${room.path}/${room.id}/chatMessages/${contentID}`, { body: { text: content } });
                }
                return room.send(content);
            })
                .then((response) => ({ type: "sent", serviceID: this.serviceId(), id: response.id }));
        });
    }
    joinRoom(room) {
        return new Promise((resolve, reject) => {
            if (room.uri) {
                return this.session.rooms.join(room.uri)
                    .then(resolve)
                    .catch(reject);
            }
            else if (room.url) {
                return this.session.rooms.join(room.url.replace(/^\/|\/$/g, ""))
                    .then(resolve)
                    .catch(reject);
            }
            return reject(new Error(`Cannot join room ${room.id}`));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;
