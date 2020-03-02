import { Player } from './types';
import { instancePlayer } from './utility';
import {
  EVENT_CONNECT,
  EVENT_DISCONNECT,
  EVENT_REGISTER,
  EVENT_PLAYER_TRANSLATE,
  EVENT_PLAYER_ROTATE,
  EVENT_LOAD_PLAYERS,
  EVENT_PLAYER_FLIP,
  EVENT_EYE_MOVE
} from './constants';
import { Socket } from 'socket.io';
import {
  onConnect,
  onDisconnect,
  onRegister,
  onPlayerTranslate,
  onPlayerRotate,
  onLoadPlayers,
  onPlayerFlip,
  onEyeMove
} from './socket-events';

// variables
const players: Player[] = [];
//#region main events
export function onSocketConnection(socket: Socket) {
  // instance current player
  let currentPlayer: Player = instancePlayer();
  //#region events
  // init players
  socket.on(EVENT_LOAD_PLAYERS, onLoadPlayers(socket, players));
  // connect
  socket.on(EVENT_CONNECT, onConnect(socket, players));
  // disconnect
  socket.on(EVENT_DISCONNECT, onDisconnect(socket, currentPlayer, players));
  // register player
  socket.on(EVENT_REGISTER, onRegister(socket, currentPlayer, players));
  // player move
  socket.on(EVENT_PLAYER_TRANSLATE, onPlayerTranslate(socket, currentPlayer));
  // player rotate
  socket.on(EVENT_PLAYER_ROTATE, onPlayerRotate(socket, currentPlayer));
  // player flip
  socket.on(EVENT_PLAYER_FLIP, onPlayerFlip(socket, currentPlayer));
  // player's eye moves
  socket.on(EVENT_EYE_MOVE, onEyeMove(socket, currentPlayer));
  //#endregion
}
//#endregion
