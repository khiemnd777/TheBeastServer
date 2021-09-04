import { Server, Socket } from "socket.io";
import { Room } from "./room";
import AsyncLock from "async-lock";
import random from "random";
import { spawn } from "child_process";

export const MAX_NUMBER_IN_ROOM = 50;
export const ROOM_INTERACTION = "room_interaction";
export const CLIENT_INTERACTION = "client_interaction";
export const ROOM_MASTER_INTERACTION = "room_master_interaction";

const lock = new AsyncLock();

export class RoomDivisionManager {
  io: Server;
  clientsList: Socket[];
  roomsList: Room[];
  roomMatersList: any[];

  constructor(io: Server) {
    this.io = io;
    this.clientsList = [];
  }

  AddClient(client: Socket) {
    this.clientsList.push(client);
  }

  AddRoom(room: Room) {
    return lock.acquire(ROOM_INTERACTION, () => {
      this.roomsList.push(room);
    });
  }

  async CreateRoom(roomId: string) {
    // Get instance the room
    const room = {
      id: roomId,
      max: MAX_NUMBER_IN_ROOM,
      clientsList: [],
    } as Room;
    // Add the room to available list
    await this.AddRoom(room);
  }

  CreateRoomMaster() {
    return lock.acquire(ROOM_MASTER_INTERACTION, () => {
      const subprocess = spawn("TheBeast");
      this.roomMatersList.push(subprocess);
      return subprocess;
    });
  }

  CloseAllRooms() {
    return lock.acquire(ROOM_MASTER_INTERACTION, () => {
      for (let inx = 0; inx < this.roomMatersList.length; inx++) {
        const roomMaster = this.roomMatersList[inx];
        if (roomMaster && !roomMaster.killed) {
          roomMaster.kill("SIGINT");
        }
      }
      return true;
    });
  }

  async SearchAvailableRooms(attempt = 0, maxAttempt = 5): Promise<Room[]> {
    if (attempt === maxAttempt) {
      return [];
    }
    const rooms = await this.GetAvailableRooms();
    if (rooms.length) {
      return rooms;
    }
    await new Promise((r) => setTimeout(r, 1000));
    return this.SearchAvailableRooms(++attempt, maxAttempt);
  }

  async GetAvailableRooms() {
    return lock.acquire([ROOM_INTERACTION, CLIENT_INTERACTION], () => {
      return this.roomsList.filter(
        (room) => room.clientsList.length < room.max
      );
    });
  }

  GetAvailableRoom(availableRooms: Room[]) {
    const randomIndex = random.int(0, availableRooms.length);
    const availableRoom = availableRooms[randomIndex];
    return availableRoom;
  }
}
