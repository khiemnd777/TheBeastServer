import express from "express";
import http from "http";
import https from "https";
import socketIO, { Socket } from "socket.io";
import { RoomDivisionManager } from "./room-division-manager";
import { SocketConnection2 } from "./socket-connection2";
import fs from "fs";
import env from "./env.config";

export function initSocket(port: number = 7777, path: string = "socket.io") {
  const app = express();
  let server: http.Server | https.Server;
  if (env<boolean>("SOCKET_SECURE")) {
    const options: https.ServerOptions = {
      key: fs.readFileSync(env<string>("SOCKET_SECURE_KEY_PATH")),
      cert: fs.readFileSync(env<string>("SOCKET_SECURE_CERT_PATH")),
    };
    const caPath = env<string>("SOCKET_SECURE_CA_PATH");
    if (caPath) {
      options.ca = fs.readFileSync(caPath);
    }
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }
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
    console.log(`The application is terminating:`);
    console.log(` - Closes all of the rooms`);
    await roomDivisionManager.CloseAllRooms();
    console.log(` - Exits`);
    process.exit(0);
  });
}
