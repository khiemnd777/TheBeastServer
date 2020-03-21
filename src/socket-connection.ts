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
  EVENT_EYE_MOVE,
  EVENT_ARM_ROTATE,
  EVENT_WEAPON_TRIGGER
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
  onEyeMove,
  onArmRotate,
  onWeaponTrigger
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
  // player translates
  socket.on(EVENT_PLAYER_TRANSLATE, onPlayerTranslate(socket, currentPlayer));
  // player rotates
  socket.on(EVENT_PLAYER_ROTATE, onPlayerRotate(socket, currentPlayer));
  // player flip
  socket.on(EVENT_PLAYER_FLIP, onPlayerFlip(socket, currentPlayer));
  // player's eye moves
  socket.on(EVENT_EYE_MOVE, onEyeMove(socket, currentPlayer));
  // player's arm rotates
  socket.on(EVENT_ARM_ROTATE, onArmRotate(socket, currentPlayer));
  // player's weapon trigger
  socket.on(EVENT_WEAPON_TRIGGER, onWeaponTrigger(socket, currentPlayer));
  //#endregion
}
//#endregion
