import { useCallback, useEffect, useMemo, useState } from 'react';
import Board from './components/Board';
import Header from './components/Header';
import './App.css';

const emptyBoard = () => Array(9).fill(null);
const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

export const getResult = (squares) => {
  for (const line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return { winner: squares[a], line, draw: false };
  }
  return { winner: null, line: [], draw: squares.every(Boolean) };
};

const bestMove = (board, computer, human) => {
  const available = board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null);
  for (const mark of [computer, human]) {
    for (const index of available) {
      const trial = [...board]; trial[index] = mark;
      if (getResult(trial).winner === mark) return index;
    }
  }
  if (!board[4]) return 4;
  return [0, 2, 6, 8].find((index) => !board[index]) ?? available[0];
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
  const [notice, setNotice] = useState('');
  const result = useMemo(() => getResult(board), [board]);
  const computerMark = humanMark === 'X' ? 'O' : 'X';
  const computerTurn = mode === 'solo' && turn === computerMark && !result.winner && !result.draw;

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);

  const startRound = () => { setBoard(emptyBoard()); setTurn('X'); setMoves([]); setNotice(''); };
  const playMove = useCallback((index) => {
    if (board[index] || result.winner || result.draw) return;
    const next = [...board]; next[index] = turn;
    const nextResult = getResult(next);
    setNotice('');
    setBoard(next); setMoves((current) => [...current, { mark: turn, index }]);
    if (nextResult.winner) setScores((current) => ({ ...current, [nextResult.winner]: current[nextResult.winner] + 1 }));
    else if (nextResult.draw && noDrawMode) {
      setBoard(emptyBoard());
      setMoves([]);
      setTurn(turn === 'X' ? 'O' : 'X');
      setNotice('No draw — the board is refreshed. Keep playing!');
    } else if (nextResult.draw) setScores((current) => ({ ...current, draw: current.draw + 1 }));
    else setTurn(turn === 'X' ? 'O' : 'X');
  }, [board, noDrawMode, result, turn]);

  useEffect(() => {
    if (!computerTurn) return undefined;
    const timer = window.setTimeout(() => playMove(bestMove(board, computerMark, humanMark)), 420);
    return () => window.clearTimeout(timer);
  }, [computerTurn, board, computerMark, humanMark, playMove]);

  const status = result.winner ? `${result.winner} wins this round!` : result.draw ? 'It’s a draw — great defence.' : notice || (computerTurn ? 'Computer is thinking…' : `Player ${turn}'s turn`);
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
          <div className="control-group"><span className="control-label">Draw rule</span><div className="segmented-control"><button className={!noDrawMode ? 'selected' : ''} onClick={() => { setNoDrawMode(false); startRound(); }}>Allow draw</button><button className={noDrawMode ? 'selected' : ''} onClick={() => { setNoDrawMode(true); startRound(); }}>No draw</button></div></div>
        </div>
        <div className="scoreboard"><div><strong>{scores.X}</strong><span>X wins</span></div><div><strong>{scores.draw}</strong><span>Draws</span></div><div><strong>{scores.O}</strong><span>O wins</span></div></div>
        <p className={`status ${result.winner || result.draw ? 'finished' : ''}`} aria-live="polite">{status}</p>
        <Board squares={board} winnerSquares={result.line} disabled={computerTurn} onPlay={playMove} />
        <div className="actions"><button className="primary-button" onClick={startRound}>New round</button><button className="text-button" onClick={() => setScores({ X: 0, O: 0, draw: 0 })}>Reset score</button></div>
      </section>
      <aside className="moves-card"><h2>Round moves</h2>{moves.length ? <ol>{moves.map((move, index) => <li key={`${move.mark}-${move.index}`}><b>{move.mark}</b><span>Move {index + 1} · row {Math.floor(move.index / 3) + 1}, col {(move.index % 3) + 1}</span></li>)}</ol> : <p>Your moves will appear here.</p>}</aside>
    </main>
  </div>;
}

export default App;
