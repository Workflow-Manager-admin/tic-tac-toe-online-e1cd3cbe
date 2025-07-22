import React, { useState, useEffect } from 'react';
import './App.css';

// Color Variables for theme adherence (only light themed styles used, see App.css)
const COLOR = {
  primary: '#1976d2',
  accent: '#388e3c',
  secondary: '#ffffff',
};

const EMPTY_BOARD = Array(9).fill(null);
const PLAYER_X = 'X';
const PLAYER_O = 'O';

// Utility function to check winner or draw
// Returns {winner: 'X'|'O'|null, winningLine: [idx, idx, idx]|null, isDraw: boolean}
function checkGameStatus(squares) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diagonals
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
      return { winner: squares[a], winningLine: line, isDraw: false };
    }
  }
  if (squares.every(Boolean)) {
    return { winner: null, winningLine: null, isDraw: true };
  }
  return { winner: null, winningLine: null, isDraw: false };
}

// Basic AI: chooses random empty square
function computerMove(squares) {
  const emptyIndices = squares.map((v, i) => v ? null : i).filter(i => i !== null);
  if (emptyIndices.length === 0) return null;
  // For better play, add minimax here. For minimalism, stick to random.
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

// -- Board Cell Button --
function Cell({ value, onClick, highlight }) {
  return (
    <button
      className="ttt-cell"
      style={{
        color: value === PLAYER_X ? COLOR.primary : (value === PLAYER_O ? COLOR.accent : COLOR.primary),
        backgroundColor: highlight ? '#e3f2fd' : COLOR.secondary,
        borderColor: highlight ? COLOR.primary : '#e0e0e0'
      }}
      onClick={onClick}
      aria-label={value ? `Cell: ${value}` : 'Empty cell'}
    >
      {value}
    </button>
  );
}

// -- Grid Board --
function Board({ squares, onCellClick, winningLine }) {
  return (
    <div className="ttt-board">
      {squares.map((value, idx) => (
        <Cell
          key={idx}
          value={value}
          onClick={() => onCellClick(idx)}
          highlight={winningLine && winningLine.includes(idx)}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Game state
  const [squares, setSquares] = useState([...EMPTY_BOARD]);
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('pvp'); // 'pvp' or 'cpu'
  const [gameOver, setGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState({winner: null, winningLine: null, isDraw: false});
  const [score, setScore] = useState({X: 0, O: 0, Draws: 0});
  const [startingPlayer, setStartingPlayer] = useState(PLAYER_X); // rotates on restart

  // Handle move for current player (AI or human)
  useEffect(() => {
    if (mode === 'cpu' && !gameOver && !isXNext) {
      // Computer's turn (as O)
      const timer = setTimeout(() => {
        const move = computerMove(squares);
        if (move !== null && !squares[move]) {
          handleMove(move);
        }
      }, 400); // Small delay for UX
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [squares, isXNext, gameOver, mode]);

  // Check win/draw after every move
  useEffect(() => {
    const status = checkGameStatus(squares);
    setGameStatus(status);
    if (status.winner) {
      setGameOver(true);
      setScore(sc => ({
        ...sc,
        [status.winner]: sc[status.winner] + 1
      }));
    } else if (status.isDraw) {
      setGameOver(true);
      setScore(sc => ({
        ...sc,
        Draws: sc.Draws + 1
      }));
    } else {
      setGameOver(false);
    }
  }, [squares]);

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    if (squares[idx] || gameOver) return;
    const newSquares = squares.slice();
    newSquares[idx] = isXNext ? PLAYER_X : PLAYER_O;
    setSquares(newSquares);
    setIsXNext(x => !x);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    // Rotate starting player for fairness
    const nextStarting = startingPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    setSquares([...EMPTY_BOARD]);
    setGameOver(false);
    setIsXNext(nextStarting === PLAYER_X);
    setStartingPlayer(nextStarting);
    setGameStatus({winner: null, winningLine: null, isDraw: false});
  }

  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    setMode(newMode);
    handleFullReset();
  }

  // PUBLIC_INTERFACE
  function handleFullReset() {
    setSquares([...EMPTY_BOARD]);
    setGameOver(false);
    setIsXNext(PLAYER_X === startingPlayer);
    setGameStatus({winner: null, winningLine: null, isDraw: false});
    setScore({ X: 0, O: 0, Draws: 0 });
    setStartingPlayer(PLAYER_X);
  }

  // Minimalistic status message
  let statusMsg;
  if (gameStatus.winner) {
    statusMsg = `Winner: ${gameStatus.winner === PLAYER_X ? 'Player X' : (mode === 'pvp' ? 'Player O' : 'Computer')}`;
  } else if (gameStatus.isDraw) {
    statusMsg = "It's a draw!";
  } else {
    statusMsg =
      (mode === 'pvp'
        ? `Turn: ${isXNext ? 'Player X' : 'Player O'}`
        : (isXNext ? 'Your turn (X)' : "Computer's turn (O)"));
  }

  return (
    <div className="App" style={{minHeight: "100vh"}}>
      <div className="ttt-outer-container">
        {/* Header */}
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <div className="ttt-controls-bar">
          <ModeSelector current={mode} onChange={handleModeChange} />
          <button className="ttt-reset-btn" onClick={handleRestart} aria-label="Restart game">
            Restart
          </button>
        </div>
        {/* Display Score */}
        <ScoreBoard mode={mode} score={score} />
        {/* Board */}
        <div className="ttt-board-cont">
          <Board
            squares={squares}
            onCellClick={idx => {
              if (mode === 'cpu' && !isXNext) return; // Don't allow player to move during CPU turn
              if (!gameOver) handleMove(idx);
            }}
            winningLine={gameStatus.winningLine}
          />
        </div>
        {/* Status Bar */}
        <div className="ttt-status">
          <span>{statusMsg}</span>
        </div>
        {/* Full Reset */}
        <div className="ttt-bottom-controls">
          <button
            className="ttt-fullreset-btn"
            style={{marginTop: 8, background: '#eee', color: "#333", border: "1px solid #ddd"}}
            onClick={handleFullReset}
          >
            Reset Score
          </button>
        </div>
        {/* Caption */}
        <div className="ttt-footer">
          <small>
            <span role="img" aria-label="copyright">&copy;</span>
            {' '}Tic Tac Toe • React Minimal Demo
          </small>
        </div>
      </div>
    </div>
  );
}

// -- Mode Selector Component --
function ModeSelector({ current, onChange }) {
  return (
    <div className="ttt-mode-selector" role="radiogroup" aria-label="Game Mode">
      <button
        className={`ttt-mode-btn${current === 'pvp' ? ' active' : ''}`}
        onClick={() => onChange('pvp')}
        aria-pressed={current === 'pvp'}
      >
        2 Players
      </button>
      <button
        className={`ttt-mode-btn${current === 'cpu' ? ' active' : ''}`}
        onClick={() => onChange('cpu')}
        aria-pressed={current === 'cpu'}
      >
        Vs Computer
      </button>
    </div>
  );
}

// -- Scoreboard --
function ScoreBoard({ mode, score }) {
  return (
    <div className="ttt-scoreboard" aria-label="Game Score">
      <div className="ttt-score">
        <span className="ttt-score-x" title="Player X">X: {score.X}</span>
        {mode === 'pvp'
          ? <span className="ttt-score-o" title="Player O">O: {score.O}</span>
          : <span className="ttt-score-o" title="Computer">Computer: {score.O}</span>
        }
        <span className="ttt-score-draw" title="Draws">Draws: {score.Draws}</span>
      </div>
    </div>
  );
}

export default App;
