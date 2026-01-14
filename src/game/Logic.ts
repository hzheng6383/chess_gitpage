
import { BoardState, Piece, PieceType, Side, BOARD_WIDTH, BOARD_HEIGHT } from './Constants';

export class GameLogic {
    static isInside(x: number, y: number): boolean {
        return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
    }

    static getPiece(board: BoardState, x: number, y: number): Piece | null {
        if (!this.isInside(x, y)) return null;
        return board[y][x];
    }

    static isValidMove(board: BoardState, fromX: number, fromY: number, toX: number, toY: number): boolean {
        const piece = this.getPiece(board, fromX, fromY);
        if (!piece) return false;

        const target = this.getPiece(board, toX, toY);
        if (target && target.side === piece.side) return false;

        const dx = toX - fromX;
        const dy = toY - fromY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        switch (piece.type) {
            case PieceType.KING: {
                // King stays in palace (rows 0-2 or 7-9, cols 3-5)
                const inPalace = toX >= 3 && toX <= 5 && (piece.side === Side.BLACK ? toY <= 2 : toY >= 7);
                if (!inPalace) return false;
                return absDx + absDy === 1;
            }
            case PieceType.ADVISOR: {
                // Advisor stays in palace and moves diagonally
                const inPalace = toX >= 3 && toX <= 5 && (piece.side === Side.BLACK ? toY <= 2 : toY >= 7);
                if (!inPalace) return false;
                return absDx === 1 && absDy === 1;
            }
            case PieceType.ELEPHANT: {
                // Elephant moves 2 steps diagonally, cannot cross river
                if (piece.side === Side.BLACK && toY >= 5) return false;
                if (piece.side === Side.RED && toY <= 4) return false;
                if (absDx === 2 && absDy === 2) {
                    // Check for elephant eye
                    const eyeX = fromX + dx / 2;
                    const eyeY = fromY + dy / 2;
                    return this.getPiece(board, eyeX, eyeY) === null;
                }
                return false;
            }
            case PieceType.HORSE: {
                if ((absDx === 1 && absDy === 2) || (absDx === 2 && absDy === 1)) {
                    // Check for horse leg
                    const legX = absDx === 2 ? fromX + dx / 2 : fromX;
                    const legY = absDy === 2 ? fromY + dy / 2 : fromY;
                    return this.getPiece(board, legX, legY) === null;
                }
                return false;
            }
            case PieceType.CHARIOT: {
                if (dx !== 0 && dy !== 0) return false;
                return this.countPiecesInBetween(board, fromX, fromY, toX, toY) === 0;
            }
            case PieceType.CANNON: {
                if (dx !== 0 && dy !== 0) return false;
                const between = this.countPiecesInBetween(board, fromX, fromY, toX, toY);
                if (target) {
                    return between === 1;
                } else {
                    return between === 0;
                }
            }
            case PieceType.PAWN: {
                if (piece.side === Side.BLACK) {
                    if (dy < 0) return false; // Cannot move backward
                    if (fromY <= 4) { // Before crossing river
                        return dy === 1 && dx === 0;
                    } else { // After crossing river
                        return (dy === 1 && dx === 0) || (dy === 0 && absDx === 1);
                    }
                } else {
                    if (dy > 0) return false;
                    if (fromY >= 5) {
                        return dy === -1 && dx === 0;
                    } else {
                        return (dy === -1 && dx === 0) || (dy === 0 && absDx === 1);
                    }
                }
            }
        }
        return false;
    }

    static countPiecesInBetween(board: BoardState, x1: number, y1: number, x2: number, y2: number): number {
        let count = 0;
        if (x1 === x2) {
            const start = Math.min(y1, y2);
            const end = Math.max(y1, y2);
            for (let y = start + 1; y < end; y++) {
                if (this.getPiece(board, x1, y)) count++;
            }
        } else if (y1 === y2) {
            const start = Math.min(x1, x2);
            const end = Math.max(x1, x2);
            for (let x = start + 1; x < end; x++) {
                if (this.getPiece(board, x, y1)) count++;
            }
        }
        return count;
    }

    static getPossibleMoves(board: BoardState, x: number, y: number): [number, number][] {
        const moves: [number, number][] = [];
        for (let ty = 0; ty < BOARD_HEIGHT; ty++) {
            for (let tx = 0; tx < BOARD_WIDTH; tx++) {
                if (this.isValidMove(board, x, y, tx, ty)) {
                    moves.push([tx, ty]);
                }
            }
        }
        return moves;
    }

    static findKing(board: BoardState, side: Side): [number, number] | null {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const p = board[y][x];
                if (p && p.type === PieceType.KING && p.side === side) {
                    return [x, y];
                }
            }
        }
        return null;
    }

    static isCheck(board: BoardState, side: Side): boolean {
        const kingPos = this.findKing(board, side);
        if (!kingPos) return false;
        const [kx, ky] = kingPos;
        const otherSide = side === Side.RED ? Side.BLACK : Side.RED;

        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const p = board[y][x];
                if (p && p.side === otherSide) {
                    if (this.isValidMove(board, x, y, kx, ky)) {
                        return true;
                    }
                }
            }
        }

        // Special case: Kings facing each other
        const otherKingPos = this.findKing(board, otherSide);
        if (otherKingPos && otherKingPos[0] === kx) {
            if (this.countPiecesInBetween(board, kx, ky, otherKingPos[0], otherKingPos[1]) === 0) {
                return true;
            }
        }

        return false;
    }

    static makeMove(board: BoardState, fromX: number, fromY: number, toX: number, toY: number): BoardState {
        const newBoard = board.map(row => [...row]);
        newBoard[toY][toX] = newBoard[fromY][fromX];
        newBoard[fromY][fromX] = null;
        return newBoard;
    }
}
