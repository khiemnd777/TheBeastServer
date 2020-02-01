import { Player, ClientPlayer } from './types';

export function registerClientPlayer(list: Player[], data: Player) {
  list = [...list, data];
}

export function preparePlayer(data: ClientPlayer): Player {
  return {
    name: data.name,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  };
}

export function instancePlayer(): Player {
  return {
    name: 'unknown',
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  };
}
