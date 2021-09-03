import {
  ClientInformation,
  ClientRegistrar,
  ClientRegistrarFinished,
  CloneEverywhere,
  Connection,
  EmitMessage,
  NetIdentity,
} from "./types";
import {
  EVENT_CONNECT,
  EVENT_DISCONNECT,
  EVENT_REGISTER,
  EVENT_SERVER_REGISTER_FINISHED,
  EVENT_EMIT_MESSAGE,
  EVENT_CLONE_EVERYWHERE,
  SERVER,
  EVENT_CLIENT_CONNECTED,
  EVENT_SERVER_DISCONNECTED,
  EVENT_CLIENT_OTHER_DISCONNECTED,
  EVENT_RECEIVE_EMIT_MESSAGE,
  EVENT_SERVER_REGISTER,
  EVENT_BROADCAST_CLONE_EVERYWHERE,
  EVENT_CLIENT_REGISTER_FINISHED,
  EVENT_LOCALLY_REGISTER_FINISHED,
} from "./constants";
import { Socket, Server } from "socket.io";
import { DeepClone } from "./utility";

//#region main events
export class SocketConnection {
  client: ClientInformation;
  io: Server;
  socket: Socket;
  // Declare the instance current player
  constructor(io: Server, socket: Socket) {
    this.client = {
      id: -1,
      clientId: "",
      isServer: false,
    } as ClientInformation;
    this.io = io;
    this.socket = socket;
    this.init();
  }
  init() {
    this.socket.on(EVENT_CONNECT, (data: Connection) => {
      if (data.isServer) {
        console.log(`The server connects to socket.`);
        this.client.isServer = true;
        this.socket.join(SERVER);
      }
      this.socket.emit(EVENT_CLIENT_CONNECTED);
    });
    this.socket.on(EVENT_DISCONNECT, () => {
      if (this.client.isServer) {
        console.log(`The server is disconnected.`);
        this.socket.broadcast.emit(EVENT_SERVER_DISCONNECTED);
        return;
      }
      console.log(`disconnected: {id: ${this.client.id}}`);
      // emit to another clients the current player has disconnected
      const netIdentity = { id: this.client.id } as NetIdentity;
      this.socket.broadcast.emit(EVENT_CLIENT_OTHER_DISCONNECTED, netIdentity);
    });
    this.socket.on(EVENT_EMIT_MESSAGE, (data: EmitMessage) => {
      const dataCloned = DeepClone(data) as EmitMessage;
      if (dataCloned.onlyServer) {
        this.socket.broadcast
          .to(SERVER)
          .emit(EVENT_RECEIVE_EMIT_MESSAGE, dataCloned);
        return;
      }
      this.socket.broadcast.emit(EVENT_RECEIVE_EMIT_MESSAGE, dataCloned);
    });
    this.socket.on(EVENT_REGISTER, (data: ClientRegistrar) => {
      const dataCloned = DeepClone(data) as ClientRegistrar;
      this.socket.broadcast.to(SERVER).emit(EVENT_SERVER_REGISTER, dataCloned);
    });
    this.socket.on(EVENT_CLONE_EVERYWHERE, (data: CloneEverywhere) => {
      const dataCloned = DeepClone(data);
      this.socket.broadcast.emit(EVENT_BROADCAST_CLONE_EVERYWHERE, dataCloned);
    });
    this.socket.on(
      EVENT_SERVER_REGISTER_FINISHED,
      (data: ClientRegistrarFinished) => {
        const dataCloned = DeepClone(data) as ClientRegistrarFinished;
        this.socket.broadcast.emit(EVENT_CLIENT_REGISTER_FINISHED, dataCloned);
      }
    );
    this.socket.on(
      EVENT_LOCALLY_REGISTER_FINISHED,
      (data: ClientRegistrarFinished) => {
        const dataCloned = DeepClone(data) as ClientRegistrarFinished;
        // Assign current player after registering finished.
        this.client.clientId = dataCloned.clientId;
        this.client.id = dataCloned.id;
        this.client.isServer = false;
      }
    );
  }
}
//#endregion
