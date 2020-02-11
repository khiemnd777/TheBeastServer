import { Player } from './types';
import { instancePlayer } from './utility';
import {
  EVENT_CONNECT,
  EVENT_DISCONNECT,
  EVENT_REGISTER,
  EVENT_PLAYER_TRANSLATE,
  EVENT_PLAYER_ROTATE
} from './constants';
import { Socket } from 'socket.io';
import {
  onConnect,
  onDisconnect,
  onRegister,
  onPlayerMove,
  onPlayerRotate
} from './socket-events';

// variables
const players: Player[] = [];
//#region main events
export function onSocketConnection(socket: Socket) {
  // instance current player
  let currentPlayer: Player = instancePlayer();
  //#region events
  // connect
  socket.on(EVENT_CONNECT, onConnect(socket, players));
  // disconnect
  socket.on(EVENT_DISCONNECT, onDisconnect(socket, currentPlayer, players));
  // register player
  socket.on(EVENT_REGISTER, onRegister(socket, currentPlayer, players));
  // player move
  socket.on(EVENT_PLAYER_TRANSLATE, onPlayerMove(socket, currentPlayer));
  // player rotate
  socket.on(EVENT_PLAYER_ROTATE, onPlayerRotate(socket, currentPlayer));
  //#endregion
}
//#endregion
