import { Socket } from 'socket.io';
import {
  CLIENT_EVENT_CONNECTED,
  CLIENT_EVENT_OTHER_DISCONNECTED,
  CLIENT_EVENT_REGISTERED,
  CLIENT_EVENT_OTHER_REGISTERED,
  CLIENT_EVENT_PLAYER_MOVE,
  CLIENT_EVENT_PLAYER_ROTATE
} from './constants';
import { Player, ClientPlayer, Position, Rotation } from './types';
import {
  removeCurrentPlayer,
  preparePlayer,
  registerClientPlayer
} from './utility';

//#region define events
//--- connect
export const onConnect = (socket: Socket, players: Player[]) => () => {
  console.log(`new player has joined, count: ${players.length}`);
  socket.emit(CLIENT_EVENT_CONNECTED);
};
// disconnect
export const onDisconnect = (
  socket: Socket,
  currentPlayer: Player,
  players: Player[]
) => () => {
  console.log(`disconnected: ${currentPlayer.name}`);
  // emit to another clients the current player has disconnected
  socket.broadcast.emit(CLIENT_EVENT_OTHER_DISCONNECTED, currentPlayer);
  // then, remove out of playlist
  removeCurrentPlayer(players, currentPlayer);
};
//--- register player
export const onRegister = (
  socket: Socket,
  currentPlayer: Player,
  players: Player[]
) => (data: ClientPlayer) => {
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
//--- player move
export const onPlayerMove = (socket: Socket, currentPlayer: Player) => (
  data: Position
) => {
  currentPlayer.position = data.position;
  // emit to another clients about position of current player
  socket.broadcast.emit(CLIENT_EVENT_PLAYER_MOVE, currentPlayer);
};
//--- player rotate
export const onPlayerRotate = (socket: Socket, currentPlayer: Player) => (
  data: Rotation
) => {
  currentPlayer.rotation = data.rotation;
  // emit to another clients about rotation of current player
  socket.broadcast.emit(CLIENT_EVENT_PLAYER_ROTATE, currentPlayer);
};
//#endregion
