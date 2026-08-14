import { getResult } from './App';

test('identifies a winning line', () => {
  expect(getResult(['X', 'X', 'X', null, null, null, null, null, null])).toEqual({ winner: 'X', line: [0, 1, 2], draw: false });
});

test('identifies a draw', () => {
  expect(getResult(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'])).toEqual({ winner: null, line: [], draw: true });
});
