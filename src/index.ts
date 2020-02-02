import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import { Player, ClientPlayer, Position, Rotation } from './types';
import {
  preparePlayer,
  registerClientPlayer,
  instancePlayer,
  removeCurrentPlayer
} from './utility';
import {
  EVENT_CONNECT,
  EVENT_REGISTER,
  CLIENT_EVENT_CONNECTED,
  CLIENT_EVENT_REGISTERED,
  CLIENT_EVENT_OTHER_REGISTERED,
  EVENT_DISCONNECT,
  CLIENT_EVENT_OTHER_DISCONNECTED,
  EVENT_PLAYER_MOVE,
  CLIENT_EVENT_PLAYER_MOVE,
  EVENT_PLAYER_ROTATE,
  CLIENT_EVENT_PLAYER_ROTATE
} from './constants';

// alternative port
const port = 7777;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// register server to a port
server.listen(port);
app.get('/', (req, res) => res.send('The Beast Server'));

// variables
const players: Player[] = [];

// start connecting
io.on('connection', (socket: socketIO.Socket) => {
  // instance current player
  let currentPlayer: Player = instancePlayer();
  //#region events
  // connect
  socket.on(EVENT_CONNECT, () => {
    console.log(`new player has joined, count: ${players.length}`);
    socket.emit(CLIENT_EVENT_CONNECTED);
  });
  // disconnect
  socket.on(EVENT_DISCONNECT, () => {
    console.log(`disconnected: ${currentPlayer.name}`);
    // emit to another clients the current player has disconnected
    socket.broadcast.emit(CLIENT_EVENT_OTHER_DISCONNECTED, currentPlayer);
    // then, remove out of playlist
    removeCurrentPlayer(players, currentPlayer);
  });
  // register player
  socket.on(EVENT_REGISTER, (data: ClientPlayer) => {
    // map ClientPlayer to Player
    const thePlayer = preparePlayer(data);
    // register client player
    registerClientPlayer(players, thePlayer);
    // assign to currentPlayer
    currentPlayer = thePlayer;
    // emit to client registering successully
    socket.emit(CLIENT_EVENT_REGISTERED, currentPlayer);
    // emit to another clients the current player registered successfully
    socket.broadcast.emit(CLIENT_EVENT_OTHER_REGISTERED, currentPlayer);
  });
  // player move
  socket.on(EVENT_PLAYER_MOVE, (data: Position) => {
    currentPlayer.position = data.position;
    // emit to another clients about position of current player
    socket.broadcast.emit(CLIENT_EVENT_PLAYER_MOVE, currentPlayer);
  });
  // player rotate
  socket.on(EVENT_PLAYER_ROTATE, (data: Rotation) => {
    currentPlayer.rotation = data.rotation;
    // emit to another clients about rotation of current player
    socket.broadcast.emit(CLIENT_EVENT_PLAYER_ROTATE, currentPlayer);
  });
  //#endregion
});

console.log('Server is running...');
