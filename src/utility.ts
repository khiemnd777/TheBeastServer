import { Player, ClientPlayer } from './types';
import { Iditifier } from './identifier';

export function registerClientPlayer(list: Player[], data: Player) {
  // list = [...list, data];
  list.push(data);
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
    armRotation: [0, 0, 0]
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
    armRotation: [0, 0, 0]
  };
}

export function removeCurrentPlayer(players: Player[], { id }: Player) {
  const indexFound = players.findIndex(player => player.id === id);
  if (indexFound < 0) return;
  players.splice(indexFound, 1);
}

export function DeepClone(source: any) {
  return JSON.parse(JSON.stringify(source));
}
