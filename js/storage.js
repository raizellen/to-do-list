import { addTask, tasks } from './tasks.js';
import { updateProgress } from './ui.js';

export const saveTaskToLocalStorage = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

export const loadTasksFromLocalStorage = () => {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

  tasks.length = 0;
  tasks.push(...savedTasks);

  tasks.forEach(task => {
    addTask(task.text, task.completed, false, task);
  });

  const taskList = document.querySelector('.task-list');
  const progressBar = document.querySelector('.progress');
  const progressNumbers = document.querySelector('.numbers');

  updateProgress(taskList, progressBar, progressNumbers);
};