import {
  EVENT_CLIENT_CONNECTED,
  EVENT_CLIENT_OTHER_DISCONNECTED,
  MASTER,
  EVENT_SERVER_REGISTER,
  EVENT_CLIENT_REGISTER_FINISHED,
  EVENT_RECEIVE_EMIT_MESSAGE,
  EVENT_BROADCAST_CLONE_EVERYWHERE,
  EVENT_SERVER_DISCONNECTED,
} from "./constants";
import { SocketConnection } from "./socket-connection";
import {
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
export const onConnect =
  (connection: SocketConnection) => (data: Connection) => {
    if (data.isServer) {
      console.log(`The server connects to socket.`);
      connection.client.isServer = true;
      connection.socket.join(MASTER);
    }
    connection.socket.emit(EVENT_CLIENT_CONNECTED);
  };
export const onEmitMessage = (connection: SocketConnection) => (data: EmitMessage) => {
  const dataCloned = DeepClone(data);
  connection.socket.broadcast.emit(EVENT_RECEIVE_EMIT_MESSAGE, dataCloned);
};
export const onRegister = (connection: SocketConnection) => (data: ClientRegistrar) => {
  // map ClientPlayer to Player
  console.log(
    `The client sent a request to create player: ${JSON.stringify(data)}`
  );
  const dataCloned = DeepClone(data) as ClientRegistrar;
  connection.socket.broadcast.to(MASTER).emit(EVENT_SERVER_REGISTER, dataCloned);
};
export const onCloneEverywhere =
  (connection: SocketConnection) => (data: CloneEverywhere) => {
    const dataCloned = DeepClone(data);
    connection.socket.broadcast.emit(EVENT_BROADCAST_CLONE_EVERYWHERE, dataCloned);
  };
export const onRegisterFinished =
  (connection: SocketConnection) =>
  (data: ClientRegistrarFinished) => {
    const dataCloned = DeepClone(data) as ClientRegistrarFinished;
    // Assign current player after registering finished.
    connection.client.clientId = dataCloned.clientId;
    connection.client.id = dataCloned.id;
    connection.client.isServer = false;
    connection.socket.broadcast.emit(EVENT_CLIENT_REGISTER_FINISHED, dataCloned);
  };

//--- disconnect
export const onDisconnect =
  (connection: SocketConnection) => () => {
    if (connection.client.isServer) {
      console.log(`The server is disconnected.`);
      connection.socket.broadcast.emit(EVENT_SERVER_DISCONNECTED);
      return;
    }
    console.log(`disconnected: {id: ${connection.client.id}}`);
    // emit to another clients the current player has disconnected
    const netIdentity = { id: connection.client.id } as NetIdentity;
    connection.socket.broadcast.emit(EVENT_CLIENT_OTHER_DISCONNECTED, netIdentity);
  };
