import { render, screen } from '@testing-library/react';
import App from './App';

test('renders game title', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
});

test('renders mode buttons', () => {
  render(<App />);
  expect(screen.getByText(/2 Players/i)).toBeInTheDocument();
  expect(screen.getByText(/Vs Computer/i)).toBeInTheDocument();
});

test('renders restart button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /Restart/i })).toBeInTheDocument();
});
