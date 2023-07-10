"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const port = 8080;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
    console.log("connection");
    socket.on("create-team", () => {
        const hasRoom = socket.rooms.size > 1;
        if (hasRoom) {
            socket.emit("exception", { errorMessage: "Already in room!" });
            return;
        }
        const teamId = Math.random().toString(36).substr(2, 9);
        socket.join(teamId);
        socket.emit("joined-team", teamId);
    });
    socket.on("join-team", (teamId, createIfNotFound) => {
        var _a;
        const room = io.sockets.adapter.rooms.get(teamId);
        if (!room && !createIfNotFound) {
            socket.emit("exception", { errorMessage: "Room does not exist!" });
            return;
        }
        const teamSize = (_a = io.sockets.adapter.rooms.get(teamId)) === null || _a === void 0 ? void 0 : _a.size;
        if (teamSize && teamSize >= 10) {
            socket.emit("exception", { errorMessage: "Room full!" });
            return;
        }
        socket.join(teamId);
        socket.emit("joined-team", teamId);
    });
    socket.on("guess-word", (word, room) => {
        if (!word)
            return;
        socket.to(room).emit("receive-guess-word", word);
    });
    socket.on("leave-team", (teamId) => {
        console.log("leave-team", teamId);
        socket.leave(teamId);
        socket.emit("left-team");
    });
    socket.on("guess-word", (word, teamId) => {
        if (!word || !teamId)
            return;
        console.log(teamId);
        // Do async call to endpoint and check the word
        socket.emit("receive-guess-word", word);
    });
    socket.on("disconnect", () => {
        console.log("disconnected");
    });
});
io.on("connect", () => {
    console.log("connected");
});
server.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
