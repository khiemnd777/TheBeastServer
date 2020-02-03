import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import { onSocketConnection } from './socket-connection';

export function initSocket(port: number = 7777) {
  const app = express();
  const server = http.createServer(app);
  const io = socketIO(server);
  // register server to a port
  server.listen(port);
  app.get('/', (req, res) => res.send('The Beast Server'));
  io.on('connection', onSocketConnection);
}
