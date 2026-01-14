
export enum PieceType {
  KING = 'K',
  ADVISOR = 'A',
  ELEPHANT = 'E',
  HORSE = 'H',
  CHARIOT = 'R',
  CANNON = 'C',
  PAWN = 'P',
}

export enum Side {
  RED = 'red',
  BLACK = 'black',
}

export interface Piece {
  type: PieceType;
  side: Side;
  id: string; // unique id for framer-motion animations
}

export type BoardState = (Piece | null)[][];

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 10;

export const INITIAL_BOARD: BoardState = [
  // Black pieces (top)
  [
    { type: PieceType.CHARIOT, side: Side.BLACK, id: 'br1' },
    { type: PieceType.HORSE, side: Side.BLACK, id: 'bh1' },
    { type: PieceType.ELEPHANT, side: Side.BLACK, id: 'be1' },
    { type: PieceType.ADVISOR, side: Side.BLACK, id: 'ba1' },
    { type: PieceType.KING, side: Side.BLACK, id: 'bk0' },
    { type: PieceType.ADVISOR, side: Side.BLACK, id: 'ba2' },
    { type: PieceType.ELEPHANT, side: Side.BLACK, id: 'be2' },
    { type: PieceType.HORSE, side: Side.BLACK, id: 'bh2' },
    { type: PieceType.CHARIOT, side: Side.BLACK, id: 'br2' },
  ],
  [null, null, null, null, null, null, null, null, null],
  [
    null,
    { type: PieceType.CANNON, side: Side.BLACK, id: 'bc1' },
    null,
    null,
    null,
    null,
    null,
    { type: PieceType.CANNON, side: Side.BLACK, id: 'bc2' },
    null,
  ],
  [
    { type: PieceType.PAWN, side: Side.BLACK, id: 'bp1' },
    null,
    { type: PieceType.PAWN, side: Side.BLACK, id: 'bp2' },
    null,
    { type: PieceType.PAWN, side: Side.BLACK, id: 'bp3' },
    null,
    { type: PieceType.PAWN, side: Side.BLACK, id: 'bp4' },
    null,
    { type: PieceType.PAWN, side: Side.BLACK, id: 'bp5' },
  ],
  [null, null, null, null, null, null, null, null, null],
  // River
  [null, null, null, null, null, null, null, null, null],
  [
    { type: PieceType.PAWN, side: Side.RED, id: 'rp1' },
    null,
    { type: PieceType.PAWN, side: Side.RED, id: 'rp2' },
    null,
    { type: PieceType.PAWN, side: Side.RED, id: 'rp3' },
    null,
    { type: PieceType.PAWN, side: Side.RED, id: 'rp4' },
    null,
    { type: PieceType.PAWN, side: Side.RED, id: 'rp5' },
  ],
  [
    null,
    { type: PieceType.CANNON, side: Side.RED, id: 'rc1' },
    null,
    null,
    null,
    null,
    null,
    { type: PieceType.CANNON, side: Side.RED, id: 'rc2' },
    null,
  ],
  [null, null, null, null, null, null, null, null, null],
  [
    { type: PieceType.CHARIOT, side: Side.RED, id: 'rr1' },
    { type: PieceType.HORSE, side: Side.RED, id: 'rh1' },
    { type: PieceType.ELEPHANT, side: Side.RED, id: 're1' },
    { type: PieceType.ADVISOR, side: Side.RED, id: 'ra1' },
    { type: PieceType.KING, side: Side.RED, id: 'rk0' },
    { type: PieceType.ADVISOR, side: Side.RED, id: 'ra2' },
    { type: PieceType.ELEPHANT, side: Side.RED, id: 're2' },
    { type: PieceType.HORSE, side: Side.RED, id: 'rh2' },
    { type: PieceType.CHARIOT, side: Side.RED, id: 'rr2' },
  ],
];

export const PIECE_NAMES: Record<Side, Record<PieceType, string>> = {
  [Side.RED]: {
    [PieceType.KING]: '帥',
    [PieceType.ADVISOR]: '仕',
    [PieceType.ELEPHANT]: '相',
    [PieceType.HORSE]: '馬',
    [PieceType.CHARIOT]: '車',
    [PieceType.CANNON]: '炮',
    [PieceType.PAWN]: '兵',
  },
  [Side.BLACK]: {
    [PieceType.KING]: '將',
    [PieceType.ADVISOR]: '士',
    [PieceType.ELEPHANT]: '象',
    [PieceType.HORSE]: '馬',
    [PieceType.CHARIOT]: '車',
    [PieceType.CANNON]: '砲',
    [PieceType.PAWN]: '卒',
  },
};
