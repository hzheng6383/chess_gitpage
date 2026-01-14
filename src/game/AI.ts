
import { BoardState, PieceType, Side, BOARD_WIDTH, BOARD_HEIGHT } from './Constants';
import { GameLogic } from './Logic';

const PIECE_VALUES: Record<PieceType, number> = {
    [PieceType.KING]: 10000,
    [PieceType.ADVISOR]: 200,
    [PieceType.ELEPHANT]: 200,
    [PieceType.HORSE]: 400,
    [PieceType.CHARIOT]: 900,
    [PieceType.CANNON]: 450,
    [PieceType.PAWN]: 100,
};

// Simple positional bonuses
const PAWN_BONUS = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [10, 20, 30, 40, 40, 40, 30, 20, 10],
    [10, 20, 30, 40, 40, 40, 30, 20, 10],
    [10, 20, 30, 35, 35, 35, 30, 20, 10],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export class AI {
    static evaluate(board: BoardState, side: Side): number {
        let score = 0;
        const otherSide = side === Side.RED ? Side.BLACK : Side.RED;

        // Quick evaluate based on piece count and position
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const piece = board[y][x];
                if (piece) {
                    let value = PIECE_VALUES[piece.type];

                    // Positional bonuses
                    if (piece.type === PieceType.PAWN) {
                        const bonusY = piece.side === Side.BLACK ? y : (BOARD_HEIGHT - 1 - y);
                        value += PAWN_BONUS[bonusY][x] || 0;
                    } else if (piece.type === PieceType.HORSE || piece.type === PieceType.CHARIOT || piece.type === PieceType.CANNON) {
                        // Encourage central positioning
                        const centerX = 4;
                        const centerY = piece.side === Side.BLACK ? 2 : 7;
                        const dist = Math.abs(x - centerX) + Math.abs(y - centerY);
                        value += (10 - dist) * 2;
                    }

                    if (piece.side === side) score += value;
                    else score -= value;
                }
            }
        }

        // Mobility
        const myMoves = this.getAllLegalMoves(board, side).length;
        const enemyMoves = this.getAllLegalMoves(board, otherSide).length;
        score += (myMoves - enemyMoves) * 5;

        return score;
    }

    static minimax(
        board: BoardState,
        depth: number,
        alpha: number,
        beta: number,
        isMaximizing: boolean,
        aiSide: Side
    ): number {
        if (depth === 0) {
            return this.evaluate(board, aiSide);
        }

        const currentSide = isMaximizing ? aiSide : (aiSide === Side.RED ? Side.BLACK : Side.RED);
        const moves = this.getAllLegalMoves(board, currentSide);

        if (moves.length === 0) {
            return isMaximizing ? -20000 : 20000; // Checkmate
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const nextBoard = GameLogic.makeMove(board, move.fromX, move.fromY, move.toX, move.toY);
                const evaluation = this.minimax(nextBoard, depth - 1, alpha, beta, false, aiSide);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const nextBoard = GameLogic.makeMove(board, move.fromX, move.fromY, move.toX, move.toY);
                const evaluation = this.minimax(nextBoard, depth - 1, alpha, beta, true, aiSide);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    static getAllLegalMoves(board: BoardState, side: Side) {
        const moves = [];
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const piece = board[y][x];
                if (piece && piece.side === side) {
                    const possible = GameLogic.getPossibleMoves(board, x, y);
                    for (const [tx, ty] of possible) {
                        // Check if the move leaves the king in check
                        const nextBoard = GameLogic.makeMove(board, x, y, tx, ty);
                        if (!GameLogic.isCheck(nextBoard, side)) {
                            moves.push({ fromX: x, fromY: y, toX: tx, toY: ty });
                        }
                    }
                }
            }
        }
        return moves;
    }

    static getBestMove(board: BoardState, aiSide: Side, depth: number = 3) {
        const moves = this.getAllLegalMoves(board, aiSide);
        let bestMove = null;
        let bestValue = -Infinity;

        // Shuffle moves slightly to prevent predictable patterns
        moves.sort(() => Math.random() - 0.5);

        for (const move of moves) {
            const nextBoard = GameLogic.makeMove(board, move.fromX, move.fromY, move.toX, move.toY);
            const boardValue = this.minimax(nextBoard, depth - 1, -Infinity, Infinity, false, aiSide);
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
        return bestMove;
    }
}
