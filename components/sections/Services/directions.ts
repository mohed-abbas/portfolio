export const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const randDir = (): Direction => DIRECTIONS[Math.floor(Math.random() * 4)];

export const dirTransform = (dir: Direction, dist = 110) => {
  switch (dir) {
    case 'up':    return { x: 0,     y: -dist };
    case 'down':  return { x: 0,     y:  dist };
    case 'left':  return { x: -dist, y: 0 };
    case 'right': return { x:  dist, y: 0 };
  }
};

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export const opposite = (d: Direction): Direction => OPPOSITE[d];
