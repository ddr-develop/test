export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Heart extends GameObject {
  active: boolean;
}

export interface Enemy extends GameObject {
  active: boolean;
  speed: number;
}