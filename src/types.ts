export type Player = {
  id: number;
  name: string;
  position: number[];
  rotation: number[];
  flipXSign: number;
  leftEye: number[];
  rightEye: number[];
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
