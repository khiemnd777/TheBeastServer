import { Server, Socket } from "socket.io";
import { Room } from "./room";
import AsyncLock from "async-lock";
import random from "random";
import { spawn } from "child_process";

export const MAX_NUMBER_IN_ROOM = 50;
export const ROOM_INTERACTION = "room_interaction";
export const CLIENT_INTERACTION = "client_interaction";
export const ROOM_MASTER_INTERACTION = "room_master_interaction";
export const ROOM_MASTER_PATH = `C:/Works/project_game_code_blue/build/Server/TheBeast.exe`;

const lock = new AsyncLock();

export class RoomDivisionManager {
  io: Server;
  clientsList: Socket[];
  roomsList: Room[];
  roomMatersList: any[];

  constructor(io: Server) {
    this.io = io;
    this.clientsList = [];
    this.roomsList = [];
    this.roomMatersList = [];
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
      const subprocess = spawn(ROOM_MASTER_PATH);
      subprocess.stdout.on("data", (data) => {
        console.log(`stdout: ${data.toString()}`);
      });

      subprocess.stderr.on("data", (data) => {
        console.log(`stderr: ${data.toString()}`);
      });

      subprocess.on("exit", (code) => {
        console.log(`child process exited with code ${code.toString()}`);
      });

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
    console.log(` - Searches in ${attempt} time(s).`);
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
    return lock.acquire(ROOM_INTERACTION, () => {
      return this.roomsList.filter(
        (room) => room.clientsList.length < room.max
      );
    });
  }

  GetAvailableRoom(availableRooms: Room[]) {
    const randomIndex = random.int(0, availableRooms.length - 1);
    console.log(` - Generated random index: ${randomIndex}`);
    const availableRoom = availableRooms[randomIndex];
    return availableRoom;
  }

  GetRoomById(roomId: string) {
    console.log(`Get room by room-id: ${roomId}`);
    return lock.acquire(ROOM_INTERACTION, () => {
      console.log(` - Start getting room: ${JSON.stringify(this.roomsList)}`);
      return this.roomsList.find((room) => room.id === roomId);
    });
  }

  CheckInToRoom(room: Room, guestId: string) {
    return lock.acquire(`${ROOM_INTERACTION}.${room.id}`, () => {
      room && room.clientsList.push(guestId);
    });
  }

  CheckOutToRoom(roomId: string, guestId: string) {
    return lock.acquire(`${ROOM_INTERACTION}.${roomId}`, async () => {
      console.log(`Check-out for roomId: ${roomId} and guestId: ${guestId}`);
      const room = await this.GetRoomById(roomId);
      console.log(` - Room: ${JSON.stringify(room)}`);
      const checkedOutIndex = room.clientsList.indexOf(guestId);
      if (checkedOutIndex > -1) {
        room.clientsList.splice(checkedOutIndex, 1);
      }
    });
  }
}
