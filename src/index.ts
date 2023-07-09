import express, { Express, Request, Response } from "express";
import { Server, Socket } from "socket.io";

import http from "http";
const port = 8080;

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("connection");
  socket.on("createRoom", (message) => {
    console.log(`createRoom \n socket id: ${socket.id}`, message);
  });

  socket.on("join-team", (teamId: string) => {
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
    if (!word) return;
    socket.to(room).emit("receive-guess-word", word);
  });

  socket.on("leaveTeam", (teamId: string) => {
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
