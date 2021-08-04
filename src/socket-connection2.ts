import { Player } from "./types";
import { instancePlayer } from "./utility";
import {
  EVENT_CONNECT,
  EVENT_DISCONNECT,
  EVENT_REGISTER,
  EVENT_PLAYER_TRANSLATE,
  EVENT_LOAD_PLAYERS,
  EVENT_CLIENT_REGISTER_PLAYER_FINISHED,
  EVENT_RESPONSE_GETTING_PLAYERS,
  EVENT_PLAYER_STORE_ID,
  EVENT_SERVER_REGISTER_FINISHED,
  EVENT_EMIT_MESSAGE,
} from "./constants";
import { Socket, Server } from "socket.io";
import {
  onDisconnect,
  onPlayerTranslate,
  onConnect2,
  onRegisterPlayerFinished,
  onLoadPlayers2,
  onResponseGettingPlayers,
  onPlayerStoreId,
  onRegisterFinished,
  onRegister,
  onEmitMessage,
} from "./socket-events";

//#region variables
// The list of the players.
const players: Player[] = [];
// The list of the bullets.
//#endregion

//#region main events
export const onSocketConnection = (io: Server) => (socket: Socket) => {
  // Declare the instance current player
  const currentPlayer: Player = instancePlayer();
  //#region events
  socket.on(EVENT_EMIT_MESSAGE, onEmitMessage(socket));
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
  socket.on(EVENT_REGISTER, onRegister(socket));
  // register player finished.
  socket.on(
    EVENT_CLIENT_REGISTER_PLAYER_FINISHED,
    onRegisterPlayerFinished(socket, currentPlayer)
  );
  socket.on(EVENT_SERVER_REGISTER_FINISHED, onRegisterFinished(socket));
  socket.on(EVENT_PLAYER_STORE_ID, onPlayerStoreId(socket, currentPlayer));
  // player translates
  socket.on(
    EVENT_PLAYER_TRANSLATE,
    onPlayerTranslate(socket, currentPlayer, players)
  );
};

//#endregion
