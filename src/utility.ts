import { Player, ClientPlayer, Bullet, ClientBullet } from './types';
import { Iditifier } from './identifier';

function ArrayPush(array: any[], element: any) {
  array.push(element);
}

function ArraySplice(array: any[], removedIndex: number) {
  array.splice(removedIndex, 1);
}

export function registerClientPlayer(list: Player[], data: Player) {
  ArrayPush(list, data);
}

export function registerClientBullet(list: Bullet[], data: Bullet) {
  ArrayPush(list, data);
}

export function preparePlayer({ name }: ClientPlayer): Player {
  return {
    id: Iditifier.raw(),
    name: name,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    flipXSign: 1,
    leftEye: [0, 0, 0],
    rightEye: [0, 0, 0],
    armRotation: [0, 0, 0],
    headRotation: [0, 0, 0],
  };
}

export function prepareBullet({
  playerId,
  position,
  rotation,
}: ClientBullet): Bullet {
  return {
    id: Iditifier.raw(),
    playerId: playerId,
    position: position,
    rotation: rotation,
  };
}

export function instancePlayer(): Player {
  return {
    id: Iditifier.EMPTY,
    name: 'unknown',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    flipXSign: 1,
    leftEye: [0, 0, 0],
    rightEye: [0, 0, 0],
    armRotation: [0, 0, 0],
    headRotation: [0, 0, 0],
  };
}

export function removeCurrentPlayer(players: Player[], id: number) {
  const indexFound = players.findIndex((player) => player.id === id);
  if (indexFound < 0) return;
  ArraySplice(players, indexFound);
}

export function removeBullet(bullets: Bullet[], id: number) {
  const indexFound = bullets.findIndex((bullet) => bullet.id === id);
  if (indexFound < 0) return;
  ArraySplice(bullets, indexFound);
}

export function DeepClone(source: any) {
  return JSON.parse(JSON.stringify(source));
}
