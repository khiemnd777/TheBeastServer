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
  EVENT_PLAYER_DIE,
  EVENT_PLAYER_HP,
  EVENT_PLAYER_MAX_HP,
  EVENT_HP_PICKER,
  EVENT_HP_PICKER_CONSUME,
  EVENT_CLIENT_REGISTER_PLAYER_FINISHED,
  EVENT_RESPONSE_GETTING_PLAYERS,
  EVENT_FODDER_CREATE,
  EVENT_FODDER_TRANSLATE,
  EVENT_FODDER_REQUEST_LOADING,
  EVENT_FODDER_SEND_GETTING_ALL,
  EVENT_FODDER_REMOVE,
  EVENT_PLAYER_STORE_ID,
} from './constants';
import { Socket, Server } from 'socket.io';
import {
  onDisconnect,
  onPlayerTranslate,
  onPlayerRotate,
  onPlayerFlip,
  onEyeMove,
  onArmRotate,
  onWeaponTrigger,
  onBulletRegister,
  onBulletRemove,
  onHeadRotate,
  onPlayerDie,
  onPlayerHp,
  onPlayerMaxHp,
  onHpPicker,
  onHpPickerConsume,
  onRegisterPlayer2,
  onConnect2,
  onRegisterPlayerFinished,
  onLoadPlayers2,
  onResponseGettingPlayers,
  onFodderCreate,
  onFodderTranslate,
  onFodderRequestLoading,
  onFodderSendGettingAll,
  onFodderRemove,
  onPlayerStoreId,
} from './socket-events';

//#region variables
// The list of the players.
const players: Player[] = [];
// The list of the bullets.
const bullets: Bullet[] = [];
//#endregion

//#region main events
export const onSocketConnection = (io: Server) => (socket: Socket) => {
  // Declare the instance current player
  const currentPlayer: Player = instancePlayer();
  //#region events
  // init players
  socket.on(EVENT_LOAD_PLAYERS, onLoadPlayers2(io, socket, players));
  socket.on(
    EVENT_RESPONSE_GETTING_PLAYERS,
    onResponseGettingPlayers(io, socket)
  );
  // connect
  socket.on(EVENT_CONNECT, onConnect2(socket));
  // disconnect
  socket.on(EVENT_DISCONNECT, onDisconnect(io, socket, currentPlayer, players));
  // register player
  socket.on(EVENT_REGISTER, onRegisterPlayer2(socket));
  // register player finished.
  socket.on(
    EVENT_CLIENT_REGISTER_PLAYER_FINISHED,
    onRegisterPlayerFinished(socket, currentPlayer)
  );
  socket.on(EVENT_PLAYER_STORE_ID, onPlayerStoreId(socket, currentPlayer));
  // player translates
  socket.on(
    EVENT_PLAYER_TRANSLATE,
    onPlayerTranslate(socket, currentPlayer, players)
  );
  // player rotates
  socket.on(EVENT_PLAYER_ROTATE, onPlayerRotate(socket, currentPlayer));
  // player flip
  socket.on(EVENT_PLAYER_FLIP, onPlayerFlip(socket, currentPlayer));
  // player dies
  socket.on(EVENT_PLAYER_DIE, onPlayerDie(socket, currentPlayer, players));
  // player's hp
  socket.on(EVENT_PLAYER_HP, onPlayerHp(socket, currentPlayer, players));
  // player's max hp
  socket.on(EVENT_PLAYER_MAX_HP, onPlayerMaxHp(socket, players));
  // hp picker
  socket.on(EVENT_HP_PICKER, onHpPicker(socket));
  // hp picker consume.
  socket.on(EVENT_HP_PICKER_CONSUME, onHpPickerConsume(socket));
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

  //#region Fodder
  socket.on(EVENT_FODDER_CREATE, onFodderCreate(io, socket));
  socket.on(EVENT_FODDER_TRANSLATE, onFodderTranslate(io, socket));
  socket.on(EVENT_FODDER_REQUEST_LOADING, onFodderRequestLoading(io, socket));
  socket.on(EVENT_FODDER_SEND_GETTING_ALL, onFodderSendGettingAll(io, socket));
  socket.on(EVENT_FODDER_REMOVE, onFodderRemove(io, socket));
  //#endregion
};

//#endregion
