import { Confetti } from './confetti.js';

export const updateProgress = (taskList, progressBar, progressNumbers, checkCompletion = true) => {
  const totalTasks = taskList.children.length;
  const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;

  progressBar.style.width = totalTasks
    ? `${(completedTasks / totalTasks) * 100}%`
    : '0%';

  progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

  if (checkCompletion && totalTasks > 0 && completedTasks === totalTasks) {
      Confetti();
  }
};

export const updateSubtaskCount = (task, counter) => {
  const total = task.subtasks.length;
  const completed = task.subtasks.filter(subtask => subtask.completed).length;

  counter.textContent = total > 0
    ? `${completed} / ${total}`
    : '';

    const progress = counter.parentElement.querySelector('.task-progress');

    if (progress) {
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      progress.style.width = `${percentage}%`;
    }
};