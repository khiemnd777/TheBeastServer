import { Socket, Server } from "socket.io";
import {
  EVENT_CLIENT_CONNECTED,
  EVENT_CLIENT_OTHER_DISCONNECTED,
  SERVER,
  EVENT_SERVER_REGISTER,
  EVENT_CLIENT_REGISTER_FINISHED,
  EVENT_RECEIVE_EMIT_MESSAGE,
  EVENT_BROADCAST_CLONE_EVERYWHERE,
} from "./constants";
import {
  Player,
  NetIdentity,
  ClientRegistrar,
  Connection,
  ClientRegistrarFinished,
  EmitMessage,
  CloneEverywhere,
} from "./types";
import { DeepClone } from "./utility";

//#region define events
//--- connect
export const onConnect = (socket: Socket) => (data: Connection) => {
  if (data.isServer) {
    console.log(`The server connects to socket.`);
    socket.join(SERVER);
  }
  socket.emit(EVENT_CLIENT_CONNECTED);
};
export const onEmitMessage = (socket: Socket) => (data: EmitMessage) => {
  const dataCloned = DeepClone(data);
  socket.broadcast.emit(EVENT_RECEIVE_EMIT_MESSAGE, dataCloned);
};
export const onRegister = (socket: Socket) => (data: ClientRegistrar) => {
  // map ClientPlayer to Player
  console.log(
    `The client sent a request to create player: ${JSON.stringify(data)}`
  );
  const dataCloned = DeepClone(data);
  socket.broadcast.to(SERVER).emit(EVENT_SERVER_REGISTER, dataCloned);
};
export const onCloneEverywhere =
  (socket: Socket) => (data: CloneEverywhere) => {
    const dataCloned = DeepClone(data);
    socket.broadcast.emit(EVENT_BROADCAST_CLONE_EVERYWHERE, dataCloned);
  };
export const onRegisterFinished =
  (socket: Socket) => (data: ClientRegistrarFinished) => {
    const dataCloned = DeepClone(data) as ClientRegistrarFinished;
    socket.broadcast.emit(EVENT_CLIENT_REGISTER_FINISHED, dataCloned);
  };

//--- disconnect
export const onDisconnect =
  (io: Server, socket: Socket, currentPlayer: Player, players: Player[]) =>
  () => {
    console.log(`disconnected: {id: ${currentPlayer.id}}`);
    // emit to another clients the current player has disconnected
    const netIdentity = { id: currentPlayer.id } as NetIdentity;
    socket.broadcast.emit(EVENT_CLIENT_OTHER_DISCONNECTED, netIdentity);
  };
