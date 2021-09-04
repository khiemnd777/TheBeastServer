import {
  ClientInformation,
  ClientRegistrar,
  ClientRegistrarFinished,
  CloneEverywhere,
  Connection,
  EmitMessage,
  NetIdentity,
  ServerConnection,
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
  LOBBY,
} from "./constants";
import { Socket, Server } from "socket.io";
import { DeepClone } from "./utility";
import { RoomDivisionManager } from "./room-division-manager";

//#region main events
export class SocketConnection2 {
  client: ClientInformation;
  io: Server;
  socket: Socket;
  manager: RoomDivisionManager;

  constructor(io: Server, socket: Socket, manager: RoomDivisionManager) {
    this.client = {
      id: -1,
      clientId: "",
      roomId: "",
      roomMasterId: "",
      isServer: false,
    } as ClientInformation;
    this.io = io;
    this.socket = socket;
    this.manager = manager;
    this.init();
  }
  init() {
    this.socket.on("server_connect", async (data: ServerConnection) => {
      console.log(`The server connects to socket.`);
      this.client.isServer = true;
      this.client.roomId = `${data.roomId}`;
      this.client.roomMasterId = `${SERVER}.${data.roomId}`;
      // Stores the generated room
      await this.manager.CreateRoom(data.roomId);
      // Join to the room as master role.
      this.socket.join(this.client.roomMasterId);
      this.socket.emit("server_connected");
    });

    this.socket.on("client_connect", (data: Connection) => {
      // join to the lobby after the connection established.
      this.socket.join(LOBBY);
      this.socket.emit("client_connected");
    });

    // [deprecated]
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
        this.socket.broadcast
          .to(this.client.roomMasterId)
          .emit(EVENT_SERVER_DISCONNECTED);
        return;
      }
      console.log(`disconnected: {id: ${this.client.id}}`);
      // emit to another clients the current player has disconnected
      const netIdentity = { id: this.client.id } as NetIdentity;
      this.socket.broadcast
        .to(this.client.roomId)
        .emit(EVENT_CLIENT_OTHER_DISCONNECTED, netIdentity);
      this.socket.broadcast
        .to(this.client.roomMasterId)
        .emit(EVENT_CLIENT_OTHER_DISCONNECTED, netIdentity);
    });

    this.socket.on(EVENT_EMIT_MESSAGE, (data: EmitMessage) => {
      const dataCloned = DeepClone(data) as EmitMessage;
      if (dataCloned.onlyServer) {
        this.socket.broadcast
          .to(this.client.roomMasterId)
          .emit(EVENT_RECEIVE_EMIT_MESSAGE, dataCloned);
        return;
      }
      this.socket.broadcast
        .to(this.client.roomId)
        .emit(EVENT_RECEIVE_EMIT_MESSAGE, dataCloned);
      this.socket.broadcast
        .to(this.client.roomMasterId)
        .emit(EVENT_RECEIVE_EMIT_MESSAGE, dataCloned);
    });

    this.socket.on(EVENT_REGISTER, async (data: ClientRegistrar) => {
      const dataCloned = DeepClone(data) as ClientRegistrar;
      // Get available room
      let availableRooms = await this.manager.GetAvailableRooms();
      // If not found any available room
      if (!availableRooms.length) {
        // Generate a new room
        // Request a new room master
        this.manager.CreateRoomMaster();
        // Search available rooms with attempting
        availableRooms = await this.manager.SearchAvailableRooms();
        if (!availableRooms.length) {
          this.socket.broadcast.to(LOBBY).emit("room_not_found", dataCloned);
          return;
        }
        const availableRoom = this.manager.GetAvailableRoom(availableRooms);
        if (availableRoom) {
          this.client.roomId = availableRoom.id;
          this.client.roomMasterId = `${SERVER}.${availableRoom.id}`;
          this.socket.leave(LOBBY).join(this.client.roomId);
          this.socket.broadcast
            .to(this.client.roomMasterId)
            .emit(EVENT_SERVER_REGISTER, dataCloned);
          return;
        }
        this.socket.broadcast.to(LOBBY).emit("room_not_found", dataCloned);
      }
    });

    this.socket.on(
      EVENT_SERVER_REGISTER_FINISHED,
      (data: ClientRegistrarFinished) => {
        const dataCloned = DeepClone(data) as ClientRegistrarFinished;
        this.socket.broadcast
          .to(this.client.roomId)
          .emit(EVENT_CLIENT_REGISTER_FINISHED, dataCloned);
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
    this.socket.on(EVENT_CLONE_EVERYWHERE, (data: CloneEverywhere) => {
      const dataCloned = DeepClone(data);
      this.socket.broadcast
        .to(this.client.roomId)
        .emit(EVENT_BROADCAST_CLONE_EVERYWHERE, dataCloned);
      this.socket.broadcast
        .to(this.client.roomMasterId)
        .emit(EVENT_BROADCAST_CLONE_EVERYWHERE, dataCloned);
    });
  }
}
//#endregion
