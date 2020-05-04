export type Player = {
  id: number;
  name: string;
  position: number[];
  rotation: number[];
  flipXSign: number;
  leftEye: number[];
  rightEye: number[];
  armRotation: number[];
  headRotation: number[];
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
