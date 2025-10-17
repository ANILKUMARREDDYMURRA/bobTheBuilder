# Task Manager Web App

## Project Overview

A lightweight, client‑side **Task Manager** built with plain HTML, CSS, and JavaScript. It allows users to create, edit, delete, filter, and reorder tasks via drag‑and‑drop, with a dark/light theme toggle. No build step or server is required – simply open `index.html` in a browser.

---

## Tech Stack

- **HTML5** – Structure of the application.
- **CSS3** – Styling and theming (light & dark modes).
- **JavaScript (ES6)** – Core logic split into modules/classes:
  - `Task` – model representing a single task.
  - `TaskManager` – handles CRUD operations, filtering, persistence, and drag‑and‑drop.
- **LocalStorage** – Persists tasks across page reloads.

---

## Feature Checklist

- [x] Add new tasks with title, description, and due date.
- [x] Edit existing tasks inline.
- [x] Delete tasks.
- [x] Mark tasks as completed.
- [x] Filter tasks (All / Active / Completed).
- [x] Drag‑and‑drop reordering.
- [x] Light/Dark theme toggle with persistence.
- [x] Responsive layout.
- [x] Persist tasks in `localStorage`.

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/task-manager.git
   cd task-manager
   ```
2. **Open the application**
   - Locate `index.html` in the project root.
   - Open it directly in any modern browser (Chrome, Firefox, Edge, Safari).
   - No npm install, bundlers, or server is required.

---

## Usage Guide

### Adding a Task
1. Click the **"Add Task"** button or press **Enter** in the input field.
2. Fill in the title, optional description, and due date.
3. Press **Save** – the task appears in the list.

### Editing a Task
- Click the **pencil** icon on a task row.
- Modify the fields and click **Update**.

### Deleting a Task
- Click the **trash** icon on the task you wish to remove.
- Confirm the deletion if prompted.

### Toggling Completion
- Click the checkbox next to a task to mark it as completed/incomplete.

### Filtering Tasks
- Use the filter buttons **All**, **Active**, **Completed** at the top to view subsets.

### Drag‑and‑Drop Reordering
- Click and hold a task row, then drag it to the desired position.
- Release to drop; the new order is saved automatically.

### Theme Toggle
- Click the **sun/moon** icon in the header to switch between light and dark modes.
- The selected theme is stored in `localStorage` and persists across sessions.

---

## Architecture Overview

The project consists of three core files:

1. **`index.html`** – Provides the markup for the UI:
   - Header with title and theme toggle.
   - Main section containing the task input form, filter controls, and the task list.
   - Footer with the "Add Task" button.
   - Script tags load `app.js` as a module.

2. **`styles.css`** – Handles visual styling and theming:
   - CSS variables define colors for light and dark themes.
   - Layout uses Flexbox/Grid for responsiveness.
   - Transition effects for theme changes and drag‑and‑drop feedback.

3. **`app.js`** – JavaScript module that orchestrates the app logic:
   - **`Task` class** – Represents a task object with properties like `id`, `title`, `description`, `dueDate`, `completed`.
   - **`TaskManager` class** – Manages an array of `Task` instances, providing methods to add, edit, delete, filter, reorder, and persist tasks.
   - Event listeners bind UI interactions (form submissions, button clicks, drag events) to `TaskManager` methods.
   - Theme handling reads/writes the current theme to `localStorage` and updates CSS variables.

The separation keeps the UI (HTML/CSS) decoupled from business logic (JS), making the codebase easy to maintain and extend.

---

## Code Snippets

### `Task` Class Definition (`app.js`)
```javascript
/**
 * Represents a single task.
 */
export class Task {
  constructor({ id = Date.now(), title, description = "", dueDate = null, completed = false }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate; // ISO string or null
    this.completed = completed;
  }
}
```

### Adding a Task via `TaskManager`
```javascript
import { TaskManager } from './app.js';

const manager = new TaskManager();

// Example: create and add a new task
const newTask = {
  title: "Finish project documentation",
  description: "Write README and update docs",
  dueDate: "2025-12-01",
};

manager.addTask(newTask); // Persists and renders the task automatically
```

---

## Contribution Guidelines

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Make your changes, ensuring the existing functionality remains intact.
4. Run the application locally to verify UI behavior.
5. Submit a pull request with a clear description of the changes.

> **Note:** Since this project has no build step, simply ensure the modified files follow the existing coding style and pass manual testing.

---

## License

[Insert License Here] – e.g., MIT, Apache 2.0, etc.
