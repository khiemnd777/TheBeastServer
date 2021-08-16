import { Player } from "./types";
import { instancePlayer } from "./utility";
import {
  EVENT_CONNECT,
  EVENT_DISCONNECT,
  EVENT_REGISTER,
  EVENT_SERVER_REGISTER_FINISHED,
  EVENT_EMIT_MESSAGE,
  EVENT_CLONE_EVERYWHERE,
} from "./constants";
import { Socket, Server } from "socket.io";
import {
  onDisconnect,
  onConnect,
  onRegisterFinished,
  onRegister,
  onEmitMessage,
  onCloneEverywhere,
} from "./socket-events";

//#region variables
// The list of the players.
const players: Player[] = [];
//#endregion

//#region main events
export const onSocketConnection = (io: Server) => (socket: Socket) => {
  // Declare the instance current player
  const currentPlayer: Player = instancePlayer();
  //#region events
  socket.on(EVENT_CONNECT, onConnect(socket));
  socket.on(EVENT_DISCONNECT, onDisconnect(io, socket, currentPlayer, players));
  socket.on(EVENT_EMIT_MESSAGE, onEmitMessage(socket));
  socket.on(EVENT_REGISTER, onRegister(socket));
  socket.on(EVENT_CLONE_EVERYWHERE, onCloneEverywhere(socket));
  socket.on(EVENT_SERVER_REGISTER_FINISHED, onRegisterFinished(socket));
};

//#endregion
