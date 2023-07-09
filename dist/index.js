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
    socket.on("createRoom", (message) => {
        console.log(`createRoom \n socket id: ${socket.id}`, message);
    });
    socket.on("join-team", (teamId) => {
        const hasRoom = socket.rooms.size > 1;
        if (hasRoom) {
            socket.emit("exception", { errorMessage: "Already in room!" });
            return;
        }
        socket.join(teamId);
        socket.emit("joined-team", teamId);
    });
    socket.on("create-team", () => {
        const hasRoom = socket.rooms.size > 1;
        console.log("hasRoom", hasRoom);
        if (hasRoom) {
            socket.emit("exception", { errorMessage: "Already in room!" });
            return;
        }
        const teamId = Math.random().toString(36).substr(2, 9);
        socket.join(teamId);
        socket.emit("joined-team", teamId);
    });
    socket.on("guess-word", (word, room) => {
        if (!word)
            return;
        socket.to(room).emit("receive-guess-word", word);
    });
    socket.on("leaveTeam", (teamId) => {
        socket.leave(teamId);
        socket.emit("left-room");
    });
});
io.on("connect", () => {
    console.log("connected");
});
server.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
