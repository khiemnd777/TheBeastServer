import { Player, ClientPlayer, Position, Rotation } from './types';
import {
  instancePlayer,
  removeCurrentPlayer,
  preparePlayer,
  registerClientPlayer
} from './utility';
import {
  EVENT_CONNECT,
  EVENT_DISCONNECT,
  EVENT_REGISTER,
  EVENT_PLAYER_MOVE,
  EVENT_PLAYER_ROTATE,
  CLIENT_EVENT_CONNECTED,
  CLIENT_EVENT_OTHER_DISCONNECTED,
  CLIENT_EVENT_REGISTERED,
  CLIENT_EVENT_OTHER_REGISTERED,
  CLIENT_EVENT_PLAYER_MOVE,
  CLIENT_EVENT_PLAYER_ROTATE
} from './constants';
import { Socket } from 'socket.io';

// variables
const players: Player[] = [];
//#region main events
export function onSocketConnection(socket: Socket) {
  // instance current player
  let currentPlayer: Player = instancePlayer();
  //#region events
  // connect
  socket.on(EVENT_CONNECT, onConnect(socket));
  // disconnect
  socket.on(EVENT_DISCONNECT, onDisconnect(socket, currentPlayer));
  // register player
  socket.on(EVENT_REGISTER, onRegister(socket, currentPlayer, players));
  // player move
  socket.on(EVENT_PLAYER_MOVE, onPlayerMove(socket, currentPlayer));
  // player rotate
  socket.on(EVENT_PLAYER_ROTATE, onPlayerRotate(socket, currentPlayer));
  //#endregion
}
//#endregion

//#region define events
// connect
const onConnect = (socket: Socket) => {
  return () => {
    console.log(`new player has joined, count: ${players.length}`);
    socket.emit(CLIENT_EVENT_CONNECTED);
  };
};
// disconnect
const onDisconnect = (socket: Socket, currentPlayer: Player) => {
  return () => {
    console.log(`disconnected: ${currentPlayer.name}`);
    // emit to another clients the current player has disconnected
    socket.broadcast.emit(CLIENT_EVENT_OTHER_DISCONNECTED, currentPlayer);
    // then, remove out of playlist
    removeCurrentPlayer(players, currentPlayer);
  };
};
// register player
const onRegister = (
  socket: Socket,
  currentPlayer: Player,
  players: Player[]
) => {
  return (data: ClientPlayer) => {
    // map ClientPlayer to Player
    const thePlayer = preparePlayer(data);
    // register client player
    registerClientPlayer(players, thePlayer);
    // assign to currentPlayer
    Object.assign(currentPlayer, thePlayer);
    // emit to client registering successully
    socket.emit(CLIENT_EVENT_REGISTERED, currentPlayer);
    // emit to another clients the current player registered successfully
    socket.broadcast.emit(CLIENT_EVENT_OTHER_REGISTERED, currentPlayer);
  };
};
// player move
const onPlayerMove = (socket: Socket, currentPlayer: Player) => {
  return (data: Position) => {
    currentPlayer.position = data.position;
    // emit to another clients about position of current player
    socket.broadcast.emit(CLIENT_EVENT_PLAYER_MOVE, currentPlayer);
  };
};
// player rotate
const onPlayerRotate = (socket: Socket, currentPlayer: Player) => {
  return (data: Rotation) => {
    currentPlayer.rotation = data.rotation;
    // emit to another clients about rotation of current player
    socket.broadcast.emit(CLIENT_EVENT_PLAYER_ROTATE, currentPlayer);
  };
};
//#endregion
