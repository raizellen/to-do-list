import { loadTasksFromLocalStorage } from './storage.js';
import { setupTaskEvents } from './tasks.js';

document.addEventListener('DOMContentLoaded', () => {
  loadTasksFromLocalStorage();
  setupTaskEvents();
});