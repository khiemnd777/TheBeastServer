import express from "express";
import http from "http";
import socketIO, { Socket } from "socket.io";
import { RoomDivisionManager } from "./room-division-manager";
import { SocketConnection2 } from "./socket-connection2";

export function initSocket(port: number = 7777, path: string = "socket.io") {
  const app = express();
  const server = http.createServer(app);
  const io = socketIO(server, {
    path: path,
  });
  // Instance the rooms division manager
  const roomDivisionManager = new RoomDivisionManager(io);

  // register server to a port
  server.listen(port);
  app.get("/", (req, res) => res.send("The Beast Server"));
  // io.on(
  //   "connection", (socket: Socket) => new SocketConnection(io, socket)
  // );
  io.on(
    "connection",
    (socket: Socket) => new SocketConnection2(io, socket, roomDivisionManager)
  );

  // Close all the rooms before terminating the application
  process.on("SIGINT", async () => {
    await roomDivisionManager.CloseAllRooms();
    process.exit(0);
  });
}
