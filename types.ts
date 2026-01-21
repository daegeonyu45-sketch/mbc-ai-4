
export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Vector2D;
  radius: number;
  speed: number;
  color: string;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
}

export interface Zombie extends Entity {
  damage: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER'
}

export interface GameSettings {
  level: number;
  score: number;
  survivalTime: number;
  zombieCount: number;
}
