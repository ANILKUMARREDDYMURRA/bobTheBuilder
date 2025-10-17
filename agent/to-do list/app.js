// app.js - Core module for ColorfulTodo
// Implements Task model, TaskManager state, DOM caching, rendering, form handling,
// filtering, theming, drag-and-drop, and initialization.

// ====================
// 1. Data Model
// ====================
class Task {
  /**
   * @param {number|string} id - Unique identifier for the task.
   * @param {string} title - Title of the task.
   * @param {string} [description=''] - Optional description.
   * @param {boolean} [completed=false] - Completion status.
   */
  constructor(id, title, description = '', completed = false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.completed = completed;
  }

  /** Toggle the completed flag */
  toggleComplete() {
    this.completed = !this.completed;
  }

  /**
   * Update title and/or description.
   * @param {{title?:string, description?:string}} data
   */
  update({ title, description }) {
    if (typeof title === 'string') this.title = title;
    if (typeof description === 'string') this.description = description;
  }
}

// ====================
// 2. State Management (TaskManager singleton)
// ====================
const TaskManager = {
  tasks: [], // Array of Task instances
  filter: 'all', // 'all' | 'active' | 'completed'

  /** Load tasks from localStorage and instantiate Task objects */
  loadFromStorage() {
    const raw = localStorage.getItem('colorfulTodoTasks');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      // Ensure we get an array of plain objects
      if (Array.isArray(parsed)) {
        this.tasks = parsed.map(obj => new Task(obj.id, obj.title, obj.description, obj.completed));
      }
    } catch (e) {
      console.error('Failed to parse tasks from storage', e);
    }
  },

  /** Persist current tasks array to localStorage */
  saveToStorage() {
    const plain = this.tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      completed: t.completed,
    }));
    localStorage.setItem('colorfulTodoTasks', JSON.stringify(plain));
  },

  /** Add a new task and re‑render */
  addTask(title, description = '') {
    const id = Date.now(); // simple unique id based on timestamp
    const newTask = new Task(id, title, description);
    this.tasks.push(newTask);
    this.saveToStorage();
    renderTasks();
  },

  /** Delete a task by id */
  deleteTask(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index > -1) {
      this.tasks.splice(index, 1);
      this.saveToStorage();
      renderTasks();
    }
  },

  /** Edit a task's title/description */
  editTask(id, data) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.update(data);
      this.saveToStorage();
      // No immediate re‑render needed because contenteditable updates in place,
      // but we call render to keep UI in sync with possible filter changes.
      renderTasks();
    }
  },

  /** Toggle completion status */
  toggleTaskComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.toggleComplete();
      this.saveToStorage();
      renderTasks();
    }
  },

  /** Reorder tasks based on new order of ids */
  reorderTasks(newOrderArray) {
    // newOrderArray is an array of ids in the desired order
    const idToTask = new Map(this.tasks.map(t => [t.id, t]));
    this.tasks = newOrderArray.map(id => idToTask.get(Number(id))).filter(Boolean);
    this.saveToStorage();
  },

  /** Set current filter and re‑render */
  setFilter(filter) {
    this.filter = filter;
    renderTasks();
  },
};

// ====================
// 3. DOM Caching
// ====================
const taskList = document.getElementById('task-list');
const newTaskForm = document.getElementById('new-task-form');
const titleInput = document.getElementById('task-title');
const descInput = document.getElementById('task-desc');
const filterNav = document.getElementById('filter-nav');
const themeToggle = document.getElementById('theme-toggle');

// ====================
// 4. Render Logic
// ====================
function renderTasks() {
  // Clear existing list
  taskList.innerHTML = '';

  const filtered = TaskManager.tasks.filter(task => {
    if (TaskManager.filter === 'active') return !task.completed;
    if (TaskManager.filter === 'completed') return task.completed;
    return true; // 'all'
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    li.draggable = true; // enable drag‑and‑drop

    // Drag handle
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = '☰';
    li.appendChild(dragHandle);

    // Completion checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'complete-checkbox';
    if (task.completed) checkbox.checked = true;
    checkbox.addEventListener('change', () => {
      TaskManager.toggleTaskComplete(task.id);
    });
    li.appendChild(checkbox);

    // Title (editable)
    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.contentEditable = 'true';
    titleSpan.textContent = task.title;
    // When editing finishes (blur) update task
    titleSpan.addEventListener('blur', () => {
      const newTitle = titleSpan.textContent.trim();
      if (newTitle && newTitle !== task.title) {
        TaskManager.editTask(task.id, { title: newTitle });
      } else {
        // revert UI if empty
        titleSpan.textContent = task.title;
      }
    });
    li.appendChild(titleSpan);

    // Description (editable, optional)
    const descP = document.createElement('p');
    descP.className = 'task-desc';
    descP.contentEditable = 'true';
    descP.textContent = task.description;
    if (!task.description) {
      descP.style.display = 'none';
    }
    descP.addEventListener('blur', () => {
      const newDesc = descP.textContent.trim();
      if (newDesc !== task.description) {
        TaskManager.editTask(task.id, { description: newDesc });
      }
      // hide if empty
      if (!newDesc) descP.style.display = 'none';
      else descP.style.display = '';
    });
    // Show description on focus if it was hidden
    descP.addEventListener('focus', () => {
      descP.style.display = '';
    });
    li.appendChild(descP);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => {
      TaskManager.deleteTask(task.id);
    });
    li.appendChild(delBtn);

    // Drag‑and‑drop event listeners (set up per item)
    li.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', task.id);
      // Add dragging class for styling
      li.classList.add('dragging');
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
    });

    // Highlight potential drop target on dragover
    li.addEventListener('dragover', e => {
      e.preventDefault(); // allow drop
      const dragging = taskList.querySelector('.dragging');
      if (!dragging || dragging === li) return;
      // Insert before or after based on mouse position
      const bounding = li.getBoundingClientRect();
      const offset = e.clientY - bounding.top + window.scrollY;
      const middle = bounding.height / 2;
      if (offset > middle) {
        li.parentNode.insertBefore(dragging, li.nextSibling);
      } else {
        li.parentNode.insertBefore(dragging, li);
      }
    });

    // Drop handling is performed on the container (taskList) to simplify logic.
    // However we also prevent default here to keep the item a valid drop target.
    li.addEventListener('drop', e => e.preventDefault());

    taskList.appendChild(li);
  });
}

// ====================
// 5. Form Handling
// ====================
if (newTaskForm) {
  newTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    if (!title) return; // required by HTML, but guard anyway
    TaskManager.addTask(title, desc);
    titleInput.value = '';
    descInput.value = '';
  });
}

// ====================
// 6. Filter Navigation
// ====================
if (filterNav) {
  filterNav.addEventListener('click', e => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    const filter = btn.dataset.filter;
    // Update active class & aria-pressed
    filterNav.querySelectorAll('button[data-filter]').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
    TaskManager.setFilter(filter);
  });
}

// ====================
// 7. Theme Toggle
// ====================
function applyStoredTheme() {
  const stored = localStorage.getItem('colorfulTodoTheme');
  if (stored === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('colorfulTodoTheme', isDark ? 'dark' : 'light');
  });
}

// ====================
// 8. Drag‑and‑Drop (container level drop handling)
// ====================
if (taskList) {
  taskList.addEventListener('dragover', e => {
    e.preventDefault(); // Necessary to allow dropping
  });

  taskList.addEventListener('drop', e => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    // Build new order based on current DOM order of .task-item elements
    const newOrder = Array.from(taskList.querySelectorAll('.task-item')).map(li => li.dataset.id);
    // Ensure the dragged element is in the list (it already is after DOM moves)
    TaskManager.reorderTasks(newOrder);
    renderTasks();
  });
}

// ====================
// 9. Initialization
// ====================
document.addEventListener('DOMContentLoaded', () => {
  TaskManager.loadFromStorage();
  applyStoredTheme();
  // Ensure default filter button reflects current filter (default 'all')
  const activeBtn = filterNav.querySelector(`button[data-filter="${TaskManager.filter}"]`);
  if (activeBtn) {
    filterNav.querySelectorAll('button[data-filter]').forEach(b => {
      b.classList.toggle('active', b === activeBtn);
      b.setAttribute('aria-pressed', b === activeBtn ? 'true' : 'false');
    });
  }
  renderTasks();
});
