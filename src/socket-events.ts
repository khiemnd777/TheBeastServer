import { Socket } from 'socket.io';
import {
  EVENT_CLIENT_CONNECTED,
  EVENT_CLIENT_OTHER_DISCONNECTED,
  EVENT_CLIENT_REGISTERED,
  EVENT_CLIENT_OTHER_REGISTERED,
  EVENT_CLIENT_PLAYER_TRANSLATE,
  EVENT_CLIENT_PLAYER_ROTATE,
  EVENT_CLIENT_LOADED_PLAYER,
  EVENT_CLIENT_EMPTY_LIST,
  EVENT_CLIENT_OTHER_PLAYER_FLIP,
  EVENT_CLIENT_OTHER_EYE_MOVE,
  EVENT_CLIENT_OTHER_ARM_ROTATE,
  EVENT_CLIENT_OTHER_WEAPON_TRIGGER,
  EVENT_CLIENT_BULLET_OTHER_REGISTERED,
  EVENT_CLIENT_BULLET_OTHER_REMOVED,
  EVENT_CLIENT_OTHER_HEAD_ROTATE,
  EVENT_CLIENT_PLAYER_WAS_DEAD,
  EVENT_CLIENT_PLAYER_SYNC_HP,
  EVENT_CLIENT_PLAYER_SYNC_MAX_HP,
  EVENT_CLIENT_SYNC_HP_PICKER,
  EVENT_CLIENT_SYNC_HP_PICKER_CONSUME,
} from './constants';
import {
  Player,
  Position,
  Rotation,
  ClientPlayer,
  Flip,
  EyeMove,
  ArmRotate,
  WeaponTrigger,
  Bullet,
  HeadRotate,
  HpPicker,
  NetIdentity,
} from './types';
import {
  removePlayer,
  preparePlayer,
  registerClientPlayer,
  DeepClone,
  removeBullet,
  getPlayer,
} from './utility';
import { FlipDirection, EyeSide } from './enums';

//#region define events
//--- connect
export const onConnect = (socket: Socket, players: Player[]) => () => {
  socket.emit(EVENT_CLIENT_CONNECTED);
};
//--- load players
export const onLoadPlayers = (socket: Socket, players: Player[]) => () => {
  if (!players.length) {
    // If the list is empty then finish loading list of players to local machine.
    socket.emit(EVENT_CLIENT_EMPTY_LIST);
    return;
  }
  // Send the list down to the local machine.
  console.log('- getting all of the players:');
  const clonePlayers = DeepClone(players) as Player[];
  const playerTotal = clonePlayers.length;
  clonePlayers.forEach((player: Player) => {
    console.log(`-- loaded player {name: ${player.name}, id: ${player.id}}`);
    socket.emit(EVENT_CLIENT_LOADED_PLAYER, {
      player: player,
      total: playerTotal,
    });
  });
};
//--- disconnect
export const onDisconnect = (
  socket: Socket,
  currentPlayer: Player,
  players: Player[]
) => () => {
  console.log(
    `disconnected: {name: ${currentPlayer.name}, id: ${currentPlayer.id}}`
  );
  // emit to another clients the current player has disconnected
  socket.broadcast.emit(EVENT_CLIENT_OTHER_DISCONNECTED, currentPlayer);
  // then, remove out of playlist
  removePlayer(players, currentPlayer.id);
};
//--- register player
export const onRegisterPlayer = (
  socket: Socket,
  currentPlayer: Player,
  players: Player[]
) => (data: ClientPlayer) => {
  // map ClientPlayer to Player
  console.log(`player name ${JSON.stringify(data)}`);
  const thePlayer = preparePlayer(data);
  // register client player
  registerClientPlayer(players, thePlayer);
  // assign to currentPlayer
  Object.assign(currentPlayer, thePlayer);
  console.log(
    `registered {name: ${currentPlayer.name}, id: ${currentPlayer.id}}`
  );
  // emit to client registering successully
  socket.emit(EVENT_CLIENT_REGISTERED, currentPlayer);
  // emit to another clients the current player registered successfully
  socket.broadcast.emit(EVENT_CLIENT_OTHER_REGISTERED, currentPlayer);
  console.log(`total players: ${players.length}`);
};
//-- play
export const onPlay = (
  socket: Socket,
  currentPlayer: Player,
  playerList: Player[]
) => () => {};
//--- player move
export const onPlayerTranslate = (
  socket: Socket,
  currentPlayer: Player,
  playerList: Player[]
) => (data: Position) => {
  const position = DeepClone(data) as Position;
  currentPlayer.position = position.position;
  const playerFound = getPlayer(playerList, data.id);
  playerFound && (playerFound.position = position.position);
  // emit to another clients about position of current player
  socket.broadcast.emit(EVENT_CLIENT_PLAYER_TRANSLATE, position);
};
//--- player rotate
export const onPlayerRotate = (socket: Socket, currentPlayer: Player) => (
  data: Rotation
) => {
  const rotation = DeepClone(data) as Rotation;
  currentPlayer.rotation = rotation.rotation;
  // emit to another clients about rotation of current player
  socket.broadcast.emit(EVENT_CLIENT_PLAYER_ROTATE, rotation);
};
//--- player flip
export const onPlayerFlip = (socket: Socket, currentPlayer: Player) => (
  data: Flip
) => {
  const flipping = DeepClone(data) as Flip;
  // assign to flipXSign if the flip direction is X.
  if (flipping.direction === FlipDirection.X) {
    currentPlayer.flipXSign = flipping.sign;
  }
  // emit to another clients about flipping of current player
  socket.broadcast.emit(EVENT_CLIENT_OTHER_PLAYER_FLIP, flipping);
};
//--- player's eye move
export const onEyeMove = (socket: Socket, currentPlayer: Player) => (
  data: EyeMove
) => {
  const eyeMove = DeepClone(data) as EyeMove;
  if (eyeMove.side === EyeSide.Left) {
    currentPlayer.leftEye = eyeMove.position;
  }
  if (eyeMove.side === EyeSide.Right) {
    currentPlayer.rightEye = eyeMove.position;
  }
  socket.broadcast.emit(EVENT_CLIENT_OTHER_EYE_MOVE, eyeMove);
};
//--- player's arm rotate
export const onArmRotate = (socket: Socket, currentPlayer: Player) => (
  data: ArmRotate
) => {
  const armRotate = DeepClone(data) as ArmRotate;
  currentPlayer.armRotation = armRotate.rotation;
  socket.broadcast.emit(EVENT_CLIENT_OTHER_ARM_ROTATE, armRotate);
};
//--- tank's head rotate
export const onHeadRotate = (socket: Socket, currentPlayer: Player) => (
  data: HeadRotate
) => {
  const headRotate = DeepClone(data) as HeadRotate;
  currentPlayer.headRotation = headRotate.rotation;
  socket.broadcast.emit(EVENT_CLIENT_OTHER_HEAD_ROTATE, headRotate);
};
//--- player dies
export const onPlayerDie = (
  socket: Socket,
  currentPlayer: Player,
  playerList: Player[]
) => (data: Player) => {
  removePlayer(playerList, data.id);
  socket.broadcast.emit(EVENT_CLIENT_PLAYER_WAS_DEAD, data);
};
//--- player's hp
export const onPlayerHp = (
  socket: Socket,
  currentPlayer: Player,
  playerList: Player[]
) => (data: Player) => {
  const playerFound = getPlayer(playerList, data.id);
  playerFound && (playerFound.hp = data.hp);
  socket.broadcast.emit(EVENT_CLIENT_PLAYER_SYNC_HP, data);
};
//--- player's max hp
export const onPlayerMaxHp = (socket: Socket, playerList: Player[]) => (
  data: Player
) => {
  const playerFound = getPlayer(playerList, data.id);
  playerFound && (playerFound.maxHp = data.maxHp);
  socket.broadcast.emit(EVENT_CLIENT_PLAYER_SYNC_MAX_HP, data);
};
//--- health poin picker
export const onHpPicker = (socket: Socket) => (data: HpPicker) => {
  const dataCloned = DeepClone(data) as HpPicker;
  socket.broadcast.emit(EVENT_CLIENT_SYNC_HP_PICKER, dataCloned);
};
export const onHpPickerConsume = (socket: Socket) => (data: NetIdentity) => {
  const dataCloned = DeepClone(data) as NetIdentity;
  socket.broadcast.emit(EVENT_CLIENT_SYNC_HP_PICKER_CONSUME, dataCloned);
};
//--- player's weapon trigger
export const onWeaponTrigger = (socket: Socket, currentPlayer: Player) => (
  data: WeaponTrigger
) => {
  const weaponTrigger = DeepClone(data) as WeaponTrigger;
  socket.broadcast.emit(EVENT_CLIENT_OTHER_WEAPON_TRIGGER, weaponTrigger);
};
//--- register bullet
export const onBulletRegister = (socket: Socket, bullets: Bullet[]) => (
  data: Bullet
) => {
  // map ClientBullet to the Bullet.
  const bulletCloned = DeepClone(data);
  // emit to another clients the current player registered successfully
  socket.broadcast.emit(EVENT_CLIENT_BULLET_OTHER_REGISTERED, bulletCloned);
};
//--- Remove bullet.
export const onBulletRemove = (socket: Socket, bullets: Bullet[]) => (
  data: NetIdentity
) => {
  var dataCloned = DeepClone(data);
  // emit to another clients the bullet has removed.
  socket.broadcast.emit(EVENT_CLIENT_BULLET_OTHER_REMOVED, dataCloned);
};
//#endregion
