import {
  ClientInformation,
  ClientRegistrar,
  ClientRegistrarFinished,
  CloneEverywhere,
  Connection,
  EmitMessage,
  NetIdentity,
  Score,
  ServerCloneEverywhere,
  ServerConnection,
} from "./types";
import {
  EVENT_CONNECT,
  EVENT_DISCONNECT,
  EVENT_REGISTER,
  EVENT_SERVER_REGISTER_FINISHED,
  EVENT_EMIT_MESSAGE,
  EVENT_CLONE_EVERYWHERE,
  MASTER,
  EVENT_CLIENT_CONNECTED,
  EVENT_SERVER_DISCONNECTED,
  EVENT_CLIENT_OTHER_DISCONNECTED,
  EVENT_RECEIVE_EMIT_MESSAGE,
  EVENT_SERVER_REGISTER,
  EVENT_BROADCAST_CLONE_EVERYWHERE,
  EVENT_CLIENT_REGISTER_FINISHED,
  EVENT_LOCALLY_REGISTER_FINISHED,
  LOBBY,
  EVENT_SERVER_CLONE_EVERYWHERE,
  EVENT_BROADCAST_SERVER_CLONE_EVERYWHERE,
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
    /*
     *  Server-side connects to the socket.
     */
    this.socket.on("server_connect", async (data: ServerConnection) => {
      console.log(`The server connects to socket.`);
      console.log(` - The room id: ${data.roomId}`);
      this.client.isServer = true;
      this.client.roomId = `${data.roomId}`;
      this.client.roomMasterId = `${MASTER}.${data.roomId}`;
      // Stores the generated room
      await this.manager.CreateRoom(this.client.roomId);
      console.log(
        ` - The room master ${this.client.roomMasterId} has been requested`
      );
      console.log(` - The room ${this.client.roomId} has been generated`);
      // Join to the room as master role.
      this.socket.join(this.client.roomMasterId).emit("server_connected");
    });

    /*
     *  Client-side connects to the socket.
     */
    this.socket.on("client_connect", (data: Connection) => {
      // join to the lobby after the connection established.
      console.log(`The client connects to socket.`);
      this.socket.join(LOBBY).emit("client_connected");
    });

    /*
     *  [deprecated] Client-side connects to the socket.
     */
    this.socket.on(EVENT_CONNECT, (data: Connection) => {
      if (data.isServer) {
        console.log(`The server connects to socket.`);
        this.client.isServer = true;
        this.socket.join(MASTER);
      }
      this.socket.emit(EVENT_CLIENT_CONNECTED);
    });

    /*
     *  Disconnect from client/server-side
     */
    this.socket.on(EVENT_DISCONNECT, async () => {
      if (this.client.isServer) {
        console.log(`The server is disconnected.`);
        this.socket.broadcast
          .to(this.client.roomMasterId)
          .emit(EVENT_SERVER_DISCONNECTED);
        return;
      }
      console.log(`disconnected: {id: ${this.client.id}}`);
      // Check-out to room
      await this.manager.CheckOutToRoom(
        this.client.roomId,
        this.client.clientId
      );
      console.log(
        `The rooms information: ${JSON.stringify(this.manager.roomsList)}`
      );
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
      console.log(`Register with client-id: ${dataCloned.clientId}`);
      // Get available room
      let availableRooms = await this.manager.GetAvailableRooms();
      console.log(
        `The available rooms list has found: ${JSON.stringify(
          availableRooms
        )}`
      );
      // If not found any available room
      if (!availableRooms.length) {
        // Generate a new room
        // Request a new room master
        console.log(`Request a room master.`);
        await this.manager.CreateRoomMaster();
        // Search available rooms with attempting
        console.log(`Searching available rooms.`);
        availableRooms = await this.manager.SearchAvailableRooms();
        console.log(
          `The available rooms list has found: ${JSON.stringify(
            availableRooms
          )}`
        );
        if (!availableRooms.length) {
          this.socket.to(LOBBY).emit("room_not_found", dataCloned);
          return;
        }
      }
      const availableRoom = this.manager.GetAvailableRoom(availableRooms);
      console.log(` - The available room: ${JSON.stringify(availableRoom)}`);
      if (availableRoom) {
        // Check-in to the available room
        await this.manager.CheckInToRoom(availableRoom, dataCloned.clientId);

        console.log(
          `The rooms information: ${JSON.stringify(this.manager.roomsList)}`
        );

        this.client.roomId = availableRoom.id;
        this.client.roomMasterId = `${MASTER}.${availableRoom.id}`;
        this.socket.leave(LOBBY).join(this.client.roomId);
        this.socket.broadcast
          .to(this.client.roomMasterId)
          .emit(EVENT_SERVER_REGISTER, dataCloned);
        return;
      }
      this.socket.to(LOBBY).emit("room_not_found", dataCloned);
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
        console.log(
          `Locally registering finished with client-id: ${dataCloned.clientId}`
        );
        this.client.clientId = dataCloned.clientId;
        this.client.id = dataCloned.id;
        this.client.isServer = false;
      }
    );
    this.socket.on(EVENT_CLONE_EVERYWHERE, (data: CloneEverywhere) => {
      const dataCloned = DeepClone(data) as CloneEverywhere;
      this.socket.broadcast
        .to(this.client.roomId)
        .emit(EVENT_BROADCAST_CLONE_EVERYWHERE, dataCloned);
      this.socket.broadcast
        .to(this.client.roomMasterId)
        .emit(EVENT_BROADCAST_CLONE_EVERYWHERE, dataCloned);
    });
    this.socket.on(EVENT_SERVER_CLONE_EVERYWHERE, (data: ServerCloneEverywhere) => {
      const dataCloned = DeepClone(data) as ServerCloneEverywhere;
      this.socket.broadcast
        .to(this.client.roomId)
        .emit(EVENT_BROADCAST_SERVER_CLONE_EVERYWHERE, dataCloned);
    });
    this.socket.on("score", (data: Score) => {
      // join to the lobby after the connection established.
      console.log(`The player with net id ${data.playerNetId} is scored: ${data.score}`);
      const dataCloned = DeepClone(data) as Score;
      this.socket.broadcast
        .to(this.client.roomId)
        .emit('score_broadcast', dataCloned);
    });
  }
}
//#endregion
