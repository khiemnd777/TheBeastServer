export type ClientInformation = {
  id: number;
  clientId: string;
  roomId: string;
  roomMasterId: string;
  isServer: boolean;
};

export type NetIdentity = {
  id: number;
};
export type NetClientId = {
  clientId: string;
};
export type Connection = {
  isServer: boolean;
};
export type ServerConnection = {
  roomId: string;
};
export type EmitMessage = {
  clientId: string;
  id: number;
  eventName: string;
  message: any;
  onlyServer: boolean;
};
export type ClientRegistrar = {
  clientId: string;
  prefabName: string;
  netName: string;
};

export type ClientRegistrarFinished = {
  clientId: string;
  id: number;
  prefabName: string;
  netName: string;
  position: number[];
  rotation: number[];
  life: number;
  maxLife: number;
};

export type CloneEverywhere = {
  clientId: string;
  prefabName: string;
  netName: string;
  position: number[];
  rotation: number[];
  life: number;
  maxLife: number;
  lifetime: number;
};

export type Player = {
  id: number;
  clientId: string;
  name: string;
  hp: number;
  maxHp: number;
  position: number[];
  rotation: number[];
  flipXSign: number;
  leftEye: number[];
  rightEye: number[];
  armRotation: number[];
  headRotation: number[];
};
export type ReponseLoadingPlayer = {
  socketId: string;
  playerName: string;
  id: number;
  position: number[];
  hp: number;
  maxHp: number;
};
export type ClientPlayer = {
  name: string;
};
export type Position = {
  id: number;
  position: number[];
};
export type Rotation = {
  id: number;
  rotation: number[];
};
export type Flip = {
  id: number;
  sign: number;
  direction: number;
};
export type EyeMove = {
  id: number;
  side: number;
  position: number[];
};
export type ArmRotate = {
  id: number;
  rotation: number[];
};
export type HeadRotate = {
  id: number;
  rotation: number[];
};
export type WeaponTrigger = {
  id: number;
};
export type Bullet = {
  id: number;
  playerId: number;
  position: number[];
  rotation: number[];
};
export type ClientBullet = {
  playerId: number;
  position: number[];
  rotation: number[];
};
export type HpPicker = {
  id: number;
  targetPosition: number[];
  position: number[];
  scale: number;
  hp: number;
};
export type Fodder = {
  id: number;
  position: number[];
};
export type FodderFetching = {
  socketId: string;
  id: number;
  position: number[];
};
