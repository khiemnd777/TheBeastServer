import socketIOClient from 'socket.io-client';
import { SAME_SIDE } from '../constants';

export const WEAPON_SPAWNER_ID = 'weapon-spawner';

export function initWeaponSpawner(
  port: number = 7777,
  path: string = '/thebeast'
) {
  const io = socketIOClient(
    `http://localhost:${port}?token=${SAME_SIDE}&appId=${WEAPON_SPAWNER_ID}`,
    {
      path: path,
    }
  );
  setInterval(() => {
    io.emit('test socket client');
  }, 2000);
}
