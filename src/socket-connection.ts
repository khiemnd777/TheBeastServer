import { Player, Bullet } from './types';
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
  EVENT_WEAPON_TRIGGER,
  EVENT_BULLET_REGISTER,
  EVENT_BULLET_REMOVE,
  EVENT_HEAD_ROTATE,
} from './constants';
import { Socket } from 'socket.io';
import {
  onConnect,
  onDisconnect,
  onRegisterPlayer,
  onPlayerTranslate,
  onPlayerRotate,
  onLoadPlayers,
  onPlayerFlip,
  onEyeMove,
  onArmRotate,
  onWeaponTrigger,
  onBulletRegister,
  onBulletRemove,
  onHeadRotate,
} from './socket-events';

//#region variables
// The list of the players.
const players: Player[] = [];
// The list of the bullets.
const bullets: Bullet[] = [];
//#endregion

//#region main events
export function onSocketConnection(socket: Socket) {
  // var query = socket.handshake.query;
  // // This is for same-side such as the client-side is also the server-side.
  // if (query.token === SAME_SIDE) {
  //   // If the appId is weapon-spawner.
  //   if (query.appId === WEAPON_SPAWNER_ID) {
  //     socket.on('test socket client', () => {
  //       socket.broadcast.emit('test socket client');
  //     });
  //   }
  //   return;
  // }
  
  // This is for external-side.
  // instance current player
  const currentPlayer: Player = instancePlayer();
  //#region events
  // init players
  socket.on(EVENT_LOAD_PLAYERS, onLoadPlayers(socket, players));
  // connect
  socket.on(EVENT_CONNECT, onConnect(socket, players));
  // disconnect
  socket.on(EVENT_DISCONNECT, onDisconnect(socket, currentPlayer, players));
  // register player
  socket.on(EVENT_REGISTER, onRegisterPlayer(socket, currentPlayer, players));
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
  // tank's head rotates
  socket.on(EVENT_HEAD_ROTATE, onHeadRotate(socket, currentPlayer));
  // player's weapon trigger
  socket.on(EVENT_WEAPON_TRIGGER, onWeaponTrigger(socket, currentPlayer));
  // register the bullet
  socket.on(EVENT_BULLET_REGISTER, onBulletRegister(socket, bullets));
  // remove the bullet
  socket.on(EVENT_BULLET_REMOVE, onBulletRemove(socket, bullets));
  //#endregion
}
//#endregion
