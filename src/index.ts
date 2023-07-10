import express, { Express, Request, Response } from "express";
import { Server, Socket } from "socket.io";

import http from "http";
const port = 8080;

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

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

  socket.on("join-team", (teamId: string, createIfNotFound?: boolean) => {
    const room = io.sockets.adapter.rooms.get(teamId);
    if (!room && !createIfNotFound) {
      socket.emit("exception", { errorMessage: "Room does not exist!" });
      return;
    }

    const teamSize = io.sockets.adapter.rooms.get(teamId)?.size;
    if (teamSize && teamSize >= 10) {
      socket.emit("exception", { errorMessage: "Room full!" });
      return;
    }

    socket.join(teamId);
    socket.emit("joined-team", teamId);
  });

  socket.on("guess-word", (word, room) => {
    if (!word) return;
    socket.to(room).emit("receive-guess-word", word);
  });

  socket.on("leave-team", (teamId: string) => {
    console.log("leave-team", teamId);
    socket.leave(teamId);
    socket.emit("left-team");
  });

  socket.on("guess-word", (word, teamId) => {
    if (!word || !teamId) return;
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
