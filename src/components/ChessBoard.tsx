
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardState, Piece, Side, PIECE_NAMES, INITIAL_BOARD, BOARD_WIDTH, BOARD_HEIGHT } from '../game/Constants';
import { GameLogic } from '../game/Logic';
import { AI } from '../game/AI';
import { useSound } from '../hooks/useSound';
import confetti from 'canvas-confetti';

const ChessBoard: React.FC = () => {
    const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
    const [selected, setSelected] = useState<[number, number] | null>(null);
    const [turn, setTurn] = useState<Side>(Side.RED);
    const [status, setStatus] = useState<string>('紅方走子');
    const [lastMove, setLastMove] = useState<{ fromX: number, fromY: number, toX: number, toY: number } | null>(null);
    const [history, setHistory] = useState<BoardState[]>([]);
    const { playSound } = useSound();

    const handleAIMove = useCallback(() => {
        if (turn === Side.BLACK) {
            setTimeout(() => {
                const bestMove = AI.getBestMove(board, Side.BLACK, 3);
                if (bestMove) {
                    executeMove(bestMove.fromX, bestMove.fromY, bestMove.toX, bestMove.toY);

                    // Check if player is checkmated
                    const nextBoard = GameLogic.makeMove(board, bestMove.fromX, bestMove.fromY, bestMove.toX, bestMove.toY);
                    if (AI.getAllLegalMoves(nextBoard, Side.RED).length === 0) {
                        setStatus('黑方獲勝！');
                        playSound('capture');
                    }
                } else {
                    setStatus('紅方獲勝！');
                    confetti();
                    playSound('win');
                }
            }, 500);
        }
    }, [board, turn, playSound]);

    useEffect(() => {
        handleAIMove();
    }, [turn, handleAIMove]);

    const executeMove = (fx: number, fy: number, tx: number, ty: number) => {
        const targetPiece = board[ty][tx];
        const newBoard = GameLogic.makeMove(board, fx, fy, tx, ty);

        // Save current state to history before moving
        setHistory(prev => [...prev, board]);

        setBoard(newBoard);
        setLastMove({ fromX: fx, fromY: fy, toX: tx, toY: ty });
        setTurn(turn === Side.RED ? Side.BLACK : Side.RED);
        setSelected(null);
        setStatus(turn === Side.RED ? '黑方思考中...' : '紅方走子');

        if (targetPiece) {
            playSound('capture');
        } else {
            playSound('move');
        }

        if (GameLogic.isCheck(newBoard, turn === Side.RED ? Side.BLACK : Side.RED)) {
            playSound('check');
            // If AI has no moves, player wins
            if (AI.getAllLegalMoves(newBoard, turn === Side.RED ? Side.BLACK : Side.RED).length === 0) {
                setStatus(turn === Side.RED ? '紅方獲勝！' : '黑方獲勝！');
                confetti();
                playSound('win');
                return;
            }
        }
    };

    const handleUndo = () => {
        if (history.length < 2 || turn !== Side.RED) return;

        // Revert to two moves ago (AI's move and Player's move)
        const newHistory = [...history];
        newHistory.pop(); // Remove AI's move state
        const previousState = newHistory.pop(); // Get Player's pre-move state

        if (previousState) {
            setBoard(previousState);
            setHistory(newHistory);
            setSelected(null);
            setLastMove(null);
            setTurn(Side.RED);
            setStatus('紅方走子');
            playSound('move');
        }
    };

    const handleCellClick = (x: number, y: number) => {
        if (turn !== Side.RED) return; // AI's turn

        const piece = board[y][x];

        if (selected) {
            const [sx, sy] = selected;
            if (GameLogic.isValidMove(board, sx, sy, x, y)) {
                // Double check if move leaves king in check
                const nextBoard = GameLogic.makeMove(board, sx, sy, x, y);
                if (GameLogic.isCheck(nextBoard, Side.RED)) {
                    alert('不能讓帥被將軍！');
                    setSelected(null);
                    return;
                }
                executeMove(sx, sy, x, y);
            } else {
                if (piece && piece.side === Side.RED) {
                    setSelected([x, y]);
                } else {
                    setSelected(null);
                }
            }
        } else {
            if (piece && piece.side === Side.RED) {
                setSelected([x, y]);
            }
        }
    };

    const CELL_SIZE = 50;
    const MARGIN = 30; // Margin to prevent pieces from being cut off at edges
    const GRID_W = (BOARD_WIDTH - 1) * CELL_SIZE;
    const GRID_H = (BOARD_HEIGHT - 1) * CELL_SIZE;
    const BOARD_W = GRID_W + MARGIN * 2;
    const BOARD_H = GRID_H + MARGIN * 2;

    const renderBoardLines = () => {
        const lines = [];
        // Vertical lines
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const lx = MARGIN + x * CELL_SIZE;
            if (x === 0 || x === 8) {
                lines.push(<line key={`vx-${x}`} x1={lx} y1={MARGIN} x2={lx} y2={MARGIN + GRID_H} stroke="var(--board-line)" strokeWidth="1.5" />);
            } else {
                lines.push(<line key={`vx-t-${x}`} x1={lx} y1={MARGIN} x2={lx} y2={MARGIN + 4 * CELL_SIZE} stroke="var(--board-line)" strokeWidth="1.5" />);
                lines.push(<line key={`vx-b-${x}`} x1={lx} y1={MARGIN + 5 * CELL_SIZE} x2={lx} y2={MARGIN + GRID_H} stroke="var(--board-line)" strokeWidth="1.5" />);
            }
        }

        // Horizontal lines
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            const ly = MARGIN + y * CELL_SIZE;
            lines.push(<line key={`hy-${y}`} x1={MARGIN} y1={ly} x2={MARGIN + GRID_W} y2={ly} stroke="var(--board-line)" strokeWidth="1.5" />);
        }

        // Palace diagonals
        const drawPalace = (startY: number) => [
            <line key={`p1-${startY}`} x1={MARGIN + 3 * CELL_SIZE} y1={MARGIN + startY * CELL_SIZE} x2={MARGIN + 5 * CELL_SIZE} y2={MARGIN + (startY + 2) * CELL_SIZE} stroke="var(--board-line)" strokeWidth="1.5" />,
            <line key={`p2-${startY}`} x1={MARGIN + 5 * CELL_SIZE} y1={MARGIN + startY * CELL_SIZE} x2={MARGIN + 3 * CELL_SIZE} y2={MARGIN + (startY + 2) * CELL_SIZE} stroke="var(--board-line)" strokeWidth="1.5" />
        ];

        lines.push(...drawPalace(0));
        lines.push(...drawPalace(7));

        return lines;
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-white">中國象棋 (AI智能)</h1>
            <div className="status-badge mb-4 bg-green-800 px-4 py-2 rounded-full border border-green-400">
                {status}
            </div>

            <div className="board-container">
                <div
                    className="chess-board"
                    style={{
                        position: 'relative',
                        width: BOARD_W,
                        height: BOARD_H,
                        padding: 0
                    }}
                >
                    {/* SVG Lines */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                        {renderBoardLines()}
                    </svg>

                    <div className="river" style={{
                        position: 'absolute',
                        top: MARGIN + 4 * CELL_SIZE,
                        left: MARGIN,
                        width: GRID_W,
                        height: CELL_SIZE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'var(--board-line)',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}>
                        <span>楚 河</span>
                        <span style={{ margin: '0 40px' }}>漢 界</span>
                    </div>

                    {/* Interaction Grid (HIGHEST Z-INDEX) */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}>
                        {Array.from({ length: 90 }).map((_, i) => {
                            const x = i % 9;
                            const y = Math.floor(i / 9);
                            return (
                                <div
                                    key={`click-${x}-${y}`}
                                    className="cursor-pointer"
                                    style={{
                                        position: 'absolute',
                                        left: MARGIN + x * CELL_SIZE - CELL_SIZE / 2,
                                        top: MARGIN + y * CELL_SIZE - CELL_SIZE / 2,
                                        width: CELL_SIZE,
                                        height: CELL_SIZE,
                                        borderRadius: '50%',
                                        background: 'transparent' // Visible for debugging if needed: 'rgba(255,0,0,0.1)'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellClick(x, y);
                                    }}
                                />
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {board.flat().filter((p): p is Piece => p !== null).map((piece) => {
                            let px = 0, py = 0;
                            let f = false;
                            for (let y = 0; y < BOARD_HEIGHT; y++) {
                                for (let x = 0; x < BOARD_WIDTH; x++) {
                                    if (board[y][x]?.id === piece.id) { px = x; py = y; f = true; break; }
                                }
                                if (f) break;
                            }
                            const isSelected = selected && selected[0] === px && selected[1] === py;

                            return (
                                <motion.div
                                    key={piece.id}
                                    layoutId={piece.id}
                                    initial={false}
                                    animate={{
                                        left: MARGIN + px * CELL_SIZE,
                                        top: MARGIN + py * CELL_SIZE,
                                        scale: isSelected ? 1.15 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    className={`piece ${piece.side} ${isSelected ? 'selected' : ''}`}
                                    style={{
                                        position: 'absolute',
                                        width: 44,
                                        height: 44,
                                        zIndex: isSelected ? 60 : 50,
                                        marginLeft: -22,
                                        marginTop: -22,
                                        backgroundColor: '#fff',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.6rem',
                                        fontWeight: 'bold',
                                        border: `2px solid ${piece.side === Side.RED ? '#c62828' : '#212121'}`,
                                        color: piece.side === Side.RED ? '#c62828' : '#212121',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                                        pointerEvents: 'none'
                                    }}
                                >
                                    {PIECE_NAMES[piece.side][piece.type]}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Move Hints */}
                    {selected && GameLogic.getPossibleMoves(board, selected[0], selected[1])
                        .filter(([tx, ty]) => {
                            const nextBoard = GameLogic.makeMove(board, selected[0], selected[1], tx, ty);
                            return !GameLogic.isCheck(nextBoard, Side.RED);
                        })
                        .map(([mx, my]) => (
                            <div
                                key={`move-${mx}-${my}`}
                                style={{
                                    position: 'absolute',
                                    left: MARGIN + mx * CELL_SIZE,
                                    top: MARGIN + my * CELL_SIZE,
                                    width: 16,
                                    height: 16,
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                    borderRadius: '50%',
                                    zIndex: 80,
                                    pointerEvents: 'none',
                                    // Properly center the hint
                                    marginLeft: -8,
                                    marginTop: -8,
                                    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                                }}
                            />
                        ))}

                    {/* Last move highlights */}
                    {lastMove && (
                        <>
                            <div style={{
                                position: 'absolute',
                                left: MARGIN + lastMove.fromX * CELL_SIZE,
                                top: MARGIN + lastMove.fromY * CELL_SIZE,
                                width: 40, height: 40, border: '2px dashed rgba(255,255,255,0.4)',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 5,
                                pointerEvents: 'none'
                            }} />
                            <div style={{
                                position: 'absolute',
                                left: MARGIN + lastMove.toX * CELL_SIZE,
                                top: MARGIN + lastMove.toY * CELL_SIZE,
                                width: 46, height: 46, border: '2px solid rgba(255,255,255,0.6)',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 5,
                                pointerEvents: 'none'
                            }} />
                        </>
                    )}
                </div>
            </div>

            <div className="game-info flex gap-4 mt-6">
                <button className="btn" onClick={() => {
                    setBoard(INITIAL_BOARD);
                    setSelected(null);
                    setTurn(Side.RED);
                    setLastMove(null);
                    setHistory([]);
                    setStatus('紅方走子');
                }}>重新開始</button>
                <button
                    className={`btn ${history.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleUndo}
                    disabled={history.length < 2 || turn !== Side.RED}
                >悔棋</button>
            </div>
        </div>
    );
};

export default ChessBoard;
