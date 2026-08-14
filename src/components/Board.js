import Square from './Square';

function Board({ squares, winnerSquares, disabled, onPlay }) {
  return <div className="board" role="grid" aria-label="Tic-Tac-Toe board">{squares.map((value, index) => <Square key={index} value={value} winning={winnerSquares.includes(index)} disabled={disabled || Boolean(value)} onClick={() => onPlay(index)} />)}</div>;
}
export default Board;
