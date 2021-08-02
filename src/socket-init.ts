import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import { onSocketConnection } from './socket-connection2';

export function initSocket(port: number = 7777, path: string = 'socket.io') {
  const app = express();
  const server = http.createServer(app);
  const io = socketIO(server, {
    path: path
  });
  // register server to a port
  server.listen(port);
  app.get('/', (req, res) => res.send('The Beast Server'));
  io.on('connection', onSocketConnection(io));
}
