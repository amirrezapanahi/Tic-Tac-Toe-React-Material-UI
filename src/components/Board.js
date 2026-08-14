import Square from './Square';

const neighbours = [
  [1, 3, 4], [0, 2, 3, 4, 5], [1, 4, 5],
  [0, 1, 4, 6, 7], [0, 1, 2, 3, 5, 6, 7, 8], [1, 2, 4, 7, 8],
  [3, 4, 7], [3, 4, 5, 6, 8], [4, 5, 7],
];

function Board({ squares, winnerSquares, disabled, turn, sliding, selectedCell, onPlay }) {
  return <div className="board" role="grid" aria-label="Tic-Tac-Toe board">{squares.map((value, index) => {
    const movable = sliding && value === turn;
    const destination = sliding && selectedCell !== null && !value && neighbours[selectedCell].includes(index);
    const canClick = !disabled && (sliding ? movable || destination : !value);
    return <Square key={index} value={value} winning={winnerSquares.includes(index)} selected={selectedCell === index} destination={destination} disabled={!canClick} onClick={() => onPlay(index)} />;
  })}</div>;
}

export default Board;
