document.addEventListener('DOMContentLoaded', () => {
  let tasks = [];

  const taskInput = document.querySelector('.task-input');
  const addTaskBtn = document.querySelector('.add-task-btn');
  const taskList = document.querySelector('.task-list');
  const progressBar = document.querySelector('.progress');
  const progressNumbers = document.querySelector('.numbers');

  const updateProgress = (checkCompletion = true) => {
    const totalTasks = taskList.children.length;
    const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;

    progressBar.style.width = totalTasks ? `${(completedTasks/totalTasks)*100}%` : '0%';
    progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

    if(checkCompletion && totalTasks > 0 && completedTasks === totalTasks){
      Confetti();
    }
  }

  const saveTaskToLocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  const loadTasksFromLocalStorage = () => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = savedTasks;
    tasks.forEach(task => {
      addTask(task.text, task.completed, false, task);
    });
    updateProgress();
  }

  const makeDraggable = (li, taskArray, task) => {
    li.addEventListener('dragstart', () => {
      li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      const items = [...li.parentElement.children];
      taskArray.sort((a, b) => {
        const aLi = items.find(item => item.task === a);
        const bLi = items.find(item => item.task === b);
        return items.indexOf(aLi) - items.indexOf(bLi);
      });
      saveTaskToLocalStorage();
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingItem = document.querySelector('.dragging');
      if (!draggingItem || draggingItem === li) {
        return;
      }
      const items = [...li.parentElement.children];
      const currentIndex = items.indexOf(draggingItem);
      const targetIndex = items.indexOf(li);

      if (currentIndex < targetIndex) {
        li.after(draggingItem);
      } else {
        li.before(draggingItem);
      }
    });
  };

  const updateSubtaskCount = (task, counter) => {
    const total = task.subtasks.length;
    const completed = task.subtasks.filter(subtask => subtask.completed).length;

    counter.textContent = total > 0
      ? `${completed} / ${total}`
      : '';
  };

  const addTask = (text, completed = false, save = true, existingTask = null) => {
    const taskText = text || taskInput.value.trim();
    if(!taskText){
      return;
    }

    const task = existingTask || {
      text: taskText,
      completed: completed,
      subtasks: []
    };

    if (save) {
      tasks.push(task);
    }

    const li = document.createElement('li');
    li.draggable = true;
    li.task = task;
    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''}>
      <span>${taskText}</span>
      <span class="subtask-count"></span>

      <div class="task-buttons">
        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    const subtaskCount = li.querySelector('.subtask-count');
    updateSubtaskCount(task, subtaskCount);

    const checkbox = li.querySelector('.checkbox');
    const editBtn = li.querySelector('.edit-btn');

    if (completed){
      li.classList.add('completed');
      editBtn.disabled = true;
      editBtn.style.opacity = '0.5';
      editBtn.style.pointerEvents = 'none';
    }

    checkbox.addEventListener('change', () => {
      const isChecked = checkbox.checked;
      task.completed = isChecked;
      li.classList.toggle('completed', isChecked);
      editBtn.disabled = isChecked;
      editBtn.style.opacity = isChecked ? '0.5' : '1';
      editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
      updateProgress();
      saveTaskToLocalStorage();
    })

    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if(!checkbox.checked){
        taskInput.value = task.text;
        const index = tasks.indexOf(task);
        if (index !== -1) {
          tasks.splice(index, 1);
        }
        li.remove();
        updateProgress(false);
        saveTaskToLocalStorage();
      }
    })

    li.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const index = tasks.indexOf(task);
      if(index !== -1){
        tasks.splice(index, 1);
      }
      const currentContainer = li.closest('.container');
      const containers = document.querySelectorAll('.levels-container .container');
      const currentIndex = Array.from(containers).indexOf(currentContainer);

      containers.forEach((container, index) => {
        if (index > currentIndex) {
          container.remove();
        }
      });

      li.remove();
      updateProgress();
      saveTaskToLocalStorage();
    })

    li.addEventListener('click', (e) => {
      if(e.target.classList.contains('checkbox') || e.target.closest('.task-buttons')){
        return;
      }

      openSubtasks(task, li);
    });

    taskList.appendChild(li);
    taskInput.value = '';

    makeDraggable(li, tasks, task);
    updateProgress();
    if (save) {
      saveTaskToLocalStorage();
    }
  }

  const openSubtasks = (task, li) => {
    const currentContainer = li.closest('.container');
    const containers = document.querySelectorAll('.levels-container .container');
    const currentIndex = Array.from(containers).indexOf(currentContainer);
    const nextContainer = containers[currentIndex + 1];
    const parentSubtaskCount = li.querySelector('.subtask-count');

    if (nextContainer) {
      const nextTitle = nextContainer.querySelector('h1');
      if (nextTitle && nextTitle.textContent === task.text) {
        containers.forEach((container, index) => {
          if (index > currentIndex) {
            container.remove();
          }
        });

        return;
      }
      containers.forEach((container, index) => {
        if (index > currentIndex) {
          container.remove();
        }
      });
    }

    const container = document.createElement('div');
    container.className = 'container';
    container.innerHTML = `
      <div class="app">
        <h1>${task.text}</h1>

        <div class="stat-container">
          <div class="details">
            <h3>Keep it up!</h3>
            <div class="progressbar">
              <div class="progress"></div>
            </div>
          </div>

          <div class="stats-number">
            <p class="numbers">0 / 0</p>
          </div>
        </div>

        <form class="input-area">
          <input type="text" class="task-input" placeholder="Add a new task">
          <button type="submit" class="add-task-btn">
            <i class="fa-solid fa-plus"></i>
          </button>
        </form>

        <div class="todo-container">
          <ul class="task-list"></ul>
        </div>
      </div>
    `;
    document.querySelector('.levels-container').appendChild(container);

    const taskList = container.querySelector('.task-list');
    const progressBar = container.querySelector('.progress');
    const progressNumbers = container.querySelector('.numbers');

    const updateSubtaskProgress = () => {
      const totalTasks = taskList.children.length;
      const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;

      progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%';
      progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;
    };

    task.subtasks.forEach(subtask => {
      const li = document.createElement('li');
      li.draggable = true;
      li.task = subtask;
      li.innerHTML = `
        <input type="checkbox" class="checkbox">
        <span>${subtask.text}</span>
        <span class="subtask-count"></span>

        <div class="task-buttons">
          <button class="edit-btn">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="delete-btn">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;

      const subtaskCount = li.querySelector('.subtask-count');
      updateSubtaskCount(subtask, subtaskCount);
      
      taskList.appendChild(li);
      updateSubtaskProgress();

      const checkbox = li.querySelector('.checkbox');
      const editBtn = li.querySelector('.edit-btn');
      const deleteBtn = li.querySelector('.delete-btn');

      checkbox.checked = subtask.completed;
      if(subtask.completed){
        li.classList.add('completed');
        editBtn.disabled = true;
        editBtn.style.opacity = '0.5';
        editBtn.style.pointerEvents = 'none';
      }

      checkbox.addEventListener('change', () => {
        subtask.completed = checkbox.checked;
        updateSubtaskProgress();
        li.classList.toggle('completed', checkbox.checked);
        if (parentSubtaskCount) {
          updateSubtaskCount(task, parentSubtaskCount);
        }
        saveTaskToLocalStorage();
      });
      updateSubtaskProgress();

      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!checkbox.checked) {
          taskInput.value = subtask.text;
          const index = task.subtasks.indexOf(subtask);
          if(index !== -1){
            task.subtasks.splice(index, 1);
          }
          li.remove();
          updateSubtaskProgress();
          saveTaskToLocalStorage();
        }
      });

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = task.subtasks.indexOf(subtask);
        if (index !== -1) {
          task.subtasks.splice(index, 1);
        }
        const currentContainer = li.closest('.container');
        const containers = document.querySelectorAll('.levels-container .container');
        const currentIndex = Array.from(containers).indexOf(currentContainer);

        containers.forEach((container, index) => {
          if (index > currentIndex) {
            container.remove();
          }
        });

        li.remove();
        updateSubtaskProgress();
        saveTaskToLocalStorage();
      });

      li.addEventListener('click', (e) => {
        if(e.target.classList.contains('checkbox') || e.target.closest('.task-buttons')){
          return;
        }
        openSubtasks(subtask, li);
      });
      makeDraggable(li, task.subtasks, subtask);
    });

    const taskInput = container.querySelector('.task-input');
    const addTaskBtn = container.querySelector('.add-task-btn');

    addTaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = taskInput.value.trim();

      if (!text) return;

      const subtask = {
        text: text,
        completed: false,
        subtasks: []
      };

      task.subtasks.push(subtask);
      if(parentSubtaskCount){
        updateSubtaskCount(task, parentSubtaskCount);
      }

      const li = document.createElement('li');
      li.draggable = true;
      li.task = subtask;
      li.innerHTML = `
        <input type="checkbox" class="checkbox">
        <span>${subtask.text}</span>
        <span class="subtask-count"></span>
        <div class="task-buttons">
          <button class="edit-btn">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="delete-btn">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      taskList.appendChild(li);
      updateSubtaskProgress();

      const checkbox = li.querySelector('.checkbox');
      checkbox.checked = subtask.completed;

      const editBtn = li.querySelector('.edit-btn');
      const deleteBtn = li.querySelector('.delete-btn');

      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!checkbox.checked) {
          taskInput.value = subtask.text;
          const index = task.subtasks.indexOf(subtask);
          if (index !== -1) {
            task.subtasks.splice(index, 1);
          }
          updateSubtaskCount(task, parentSubtaskCount);
          li.remove();
          updateSubtaskProgress();
          saveTaskToLocalStorage();
        }
      });

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentContainer = li.closest('.container');
        const index = task.subtasks.indexOf(subtask);

        if(index !== -1){
          task.subtasks.splice(index, 1);

          if (parentSubtaskCount) {
            updateSubtaskCount(task, parentSubtaskCount);
          }
        }
        const containers = document.querySelectorAll('.levels-container .container');
        const currentIndex = Array.from(containers).indexOf(currentContainer);

        containers.forEach((container, index) => {
          if(index > currentIndex){
            container.remove();
          }
        });

        li.remove();

        updateSubtaskProgress();
        saveTaskToLocalStorage();
      });

      if(subtask.completed){
        li.classList.add('completed');
        editBtn.disabled = true;
        editBtn.style.opacity = '0.5';
        editBtn.style.pointerEvents = 'none';
      }

      checkbox.addEventListener('change', () => {
        subtask.completed = checkbox.checked;
        updateSubtaskProgress();
        li.classList.toggle('completed', checkbox.checked);
        editBtn.disabled = checkbox.checked;
        editBtn.style.opacity = checkbox.checked ? '0.5' : '1';
        editBtn.style.pointerEvents = checkbox.checked ? 'none' : 'auto';

        if (parentSubtaskCount) {
          updateSubtaskCount(task, parentSubtaskCount);
        }

        saveTaskToLocalStorage();
      });

      li.addEventListener('click', (e) => {
        if(e.target.classList.contains('checkbox') || e.target.closest('.task-buttons')){
          return;
        }
        openSubtasks(subtask, li);
      });

      makeDraggable(li, task.subtasks, subtask);
      taskInput.value = '';
      saveTaskToLocalStorage();
      console.log(task.subtasks);
    });

    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTaskBtn.click();
      }
    });
  };

  addTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();
    addTask();
  });

  taskInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  })

  loadTasksFromLocalStorage();
})

const Confetti = () => {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: .94,
    startVelocity: 30,
    shapes: ["heart"],
    colors: [
      "#FFC0CB",
      "#FF69B4",
      "#FF1493",
      "#C71585"
    ]
  };
  confetti({
    ...defaults,
    particleCount: 50,
    scalar: 2
  });
  confetti({
    ...defaults,
    particleCount: 25,
    scalar: 3
  });
  confetti({
    ...defaults,
    particleCount: 10,
    scalar: 4
  });
}