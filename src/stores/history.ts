import { writable } from 'svelte/store';
import type { Command } from '../interfaces/command';

export const history = writable<Array<Command>>(
  JSON.parse(localStorage.getItem('history') || '[]'),
);

history.subscribe((value) => {
  localStorage.setItem('history', JSON.stringify(value));
});

// Add a function to clear both the store and localStorage
export function clearHistory() {
  history.set([]);
  localStorage.removeItem('history');
}
