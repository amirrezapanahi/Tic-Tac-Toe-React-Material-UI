import { useCallback, useEffect, useMemo, useState } from 'react';
import Board from './components/Board';
import Header from './components/Header';
import './App.css';

const emptyBoard = () => Array(9).fill(null);
const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const neighbours = [
  [1, 3, 4], [0, 2, 3, 4, 5], [1, 4, 5],
  [0, 1, 4, 6, 7], [0, 1, 2, 3, 5, 6, 7, 8], [1, 2, 4, 7, 8],
  [3, 4, 7], [3, 4, 5, 6, 8], [4, 5, 7],
];

export const getResult = (squares) => {
  for (const line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return { winner: squares[a], line, draw: false };
  }
  return { winner: null, line: [], draw: squares.every(Boolean) };
};

const countMarks = (board, mark) => board.filter((cell) => cell === mark).length;
const openCells = (board) => board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null);
const slideOptions = (board, mark) => board.flatMap((cell, from) => cell === mark ? neighbours[from].filter((to) => !board[to]).map((to) => ({ from, to })) : []);

const choosePlacement = (board, computer, human) => {
  const open = openCells(board);
  for (const mark of [computer, human]) {
    const winning = open.find((index) => getResult(board.map((cell, position) => position === index ? mark : cell)).winner === mark);
    if (winning !== undefined) return winning;
  }
  return !board[4] ? 4 : [0, 2, 6, 8].find((index) => !board[index]) ?? open[0];
};

const chooseSlide = (board, computer) => {
  const options = slideOptions(board, computer);
  return options.find(({ from, to }) => {
    const next = [...board]; next[from] = null; next[to] = computer;
    return getResult(next).winner === computer;
  }) ?? options[0];
};

function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState('X');
  const [mode, setMode] = useState('solo');
  const [humanMark, setHumanMark] = useState('X');
  const [noDrawMode, setNoDrawMode] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [moves, setMoves] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const result = useMemo(() => getResult(board), [board]);
  const computerMark = humanMark === 'X' ? 'O' : 'X';
  const slidingTurn = noDrawMode && countMarks(board, turn) === 3;
  const computerTurn = mode === 'solo' && turn === computerMark && !result.winner && !result.draw;

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  const startRound = () => { setBoard(emptyBoard()); setTurn('X'); setMoves([]); setSelectedCell(null); };

  const commitMove = useCallback((nextBoard, move) => {
    const nextResult = getResult(nextBoard);
    setBoard(nextBoard);
    setMoves((current) => [...current, move]);
    setSelectedCell(null);
    if (nextResult.winner) setScores((current) => ({ ...current, [nextResult.winner]: current[nextResult.winner] + 1 }));
    else if (nextResult.draw && !noDrawMode) setScores((current) => ({ ...current, draw: current.draw + 1 }));
    else setTurn((current) => current === 'X' ? 'O' : 'X');
  }, [noDrawMode]);

  const playPlacement = useCallback((index) => {
    if (board[index] || result.winner || result.draw) return;
    const next = [...board]; next[index] = turn;
    commitMove(next, { mark: turn, index, type: 'place' });
  }, [board, commitMove, result, turn]);

  const slideMark = useCallback((from, to) => {
    if (!neighbours[from].includes(to) || board[from] !== turn || board[to] || result.winner || result.draw) return;
    const next = [...board]; next[from] = null; next[to] = turn;
    commitMove(next, { mark: turn, index: to, from, type: 'slide' });
  }, [board, commitMove, result, turn]);

  const handleCellClick = (index) => {
    if (computerTurn || result.winner || result.draw) return;
    if (!slidingTurn) { playPlacement(index); return; }
    if (board[index] === turn) { setSelectedCell(index); return; }
    if (selectedCell !== null && !board[index] && neighbours[selectedCell].includes(index)) slideMark(selectedCell, index);
  };

  useEffect(() => {
    if (!computerTurn) return undefined;
    const timer = window.setTimeout(() => {
      if (noDrawMode && countMarks(board, computerMark) === 3) {
        const move = chooseSlide(board, computerMark);
        if (move) slideMark(move.from, move.to);
      } else {
        playPlacement(choosePlacement(board, computerMark, humanMark));
      }
    }, 420);
    return () => window.clearTimeout(timer);
  }, [board, computerMark, computerTurn, humanMark, noDrawMode, playPlacement, slideMark]);

  const status = result.winner ? `${result.winner} wins this round!` : result.draw ? 'It is a draw.' : computerTurn ? 'Computer is thinking…' : slidingTurn ? selectedCell === null ? `Player ${turn}: select one of your marks to move.` : 'Choose a highlighted neighbouring cell.' : `Player ${turn}'s turn`;
  const changeMode = (nextMode) => { setMode(nextMode); startRound(); };
  const changeMark = (mark) => { setHumanMark(mark); startRound(); };

  return <div className="app-shell">
    <Header theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
    <main className="game-layout">
      <section className="game-card" aria-labelledby="game-title">
        <div className="eyebrow">TACTICAL CLASSIC</div><h1 id="game-title">Tic-Tac-Toe</h1><p className="subtitle">A quick match, polished for every screen.</p>
        <div className="controls">
          <div className="control-group"><span className="control-label">Mode</span><div className="segmented-control"><button className={mode === 'solo' ? 'selected' : ''} onClick={() => changeMode('solo')}>Vs computer</button><button className={mode === 'duo' ? 'selected' : ''} onClick={() => changeMode('duo')}>Two players</button></div></div>
          {mode === 'solo' && <div className="control-group"><span className="control-label">Your mark</span><div className="segmented-control">{['X', 'O'].map((mark) => <button key={mark} className={humanMark === mark ? 'selected' : ''} onClick={() => changeMark(mark)}>{mark}</button>)}</div></div>}
          <div className="control-group"><span className="control-label">Draw rule</span><div className="segmented-control"><button className={!noDrawMode ? 'selected' : ''} onClick={() => { setNoDrawMode(false); startRound(); }}>Allow draw</button><button className={noDrawMode ? 'selected' : ''} onClick={() => { setNoDrawMode(true); startRound(); }}>Sliding mode</button></div></div>
        </div>
        <div className="scoreboard"><div><strong>{scores.X}</strong><span>X wins</span></div><div><strong>{scores.draw}</strong><span>Draws</span></div><div><strong>{scores.O}</strong><span>O wins</span></div></div>
        <p className={`status ${result.winner || result.draw ? 'finished' : ''}`} aria-live="polite">{status}</p>
        <div className="board-panel"><Board squares={board} winnerSquares={result.line} disabled={computerTurn || Boolean(result.winner || result.draw)} turn={turn} sliding={slidingTurn} selectedCell={selectedCell} onPlay={handleCellClick} /></div>
        <div className="actions"><button className="primary-button" onClick={startRound}>{result.winner || result.draw ? 'Play again' : 'Restart round'}</button><button className="text-button" onClick={() => setScores({ X: 0, O: 0, draw: 0 })}>Reset score</button></div>
      </section>
      <aside className="moves-card"><h2>Round moves</h2>{moves.length ? <ol>{moves.map((move, index) => <li key={`${move.mark}-${index}`}><b>{move.mark}</b><span>{move.type === 'slide' ? `Move ${index + 1}: ${move.from + 1} → ${move.index + 1}` : `Place ${index + 1}: cell ${move.index + 1}`}</span></li>)}</ol> : <p>Your moves will appear here.</p>}</aside>
    </main>
  </div>;
}

export default App;
