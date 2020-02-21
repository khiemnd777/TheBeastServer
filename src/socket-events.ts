import { Socket } from 'socket.io';
import {
  EVENT_CLIENT_CONNECTED,
  EVENT_CLIENT_OTHER_DISCONNECTED,
  EVENT_CLIENT_REGISTERED,
  EVENT_CLIENT_OTHER_REGISTERED,
  EVENT_CLIENT_PLAYER_TRANSLATE,
  EVENT_CLIENT_PLAYER_ROTATE,
  EVENT_CLIENT_LOADED_PLAYER,
  EVENT_CLIENT_EMPTY_LIST
} from './constants';
import { Player, Position, Rotation, ClientPlayer } from './types';
import {
  removeCurrentPlayer,
  preparePlayer,
  registerClientPlayer,
  DeepClone
} from './utility';

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
      total: playerTotal
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
  removeCurrentPlayer(players, currentPlayer);
};
//--- register player
export const onRegister = (
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
export const onPlayerTranslate = (socket: Socket, currentPlayer: Player) => (
  data: Position
) => {
  const currentPlayerPosition = DeepClone(data) as Position;
  currentPlayer.position = currentPlayerPosition.position;
  // emit to another clients about position of current player
  socket.broadcast.emit(EVENT_CLIENT_PLAYER_TRANSLATE, currentPlayerPosition);
};
//--- player rotate
export const onPlayerRotate = (socket: Socket, currentPlayer: Player) => (
  data: Rotation
) => {
  const currentPlayerRotation = DeepClone(data) as Rotation;
  currentPlayer.rotation = currentPlayerRotation.rotation;
  // emit to another clients about rotation of current player
  socket.broadcast.emit(EVENT_CLIENT_PLAYER_ROTATE, currentPlayerRotation);
};
//#endregion
