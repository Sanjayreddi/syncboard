document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const columns = document.querySelectorAll('.task-list');

    // Initialize State from LocalStorage or use default
    let tasks = JSON.parse(localStorage.getItem('syncboard_tasks')) || [];

    // --- Core Functions ---

    function saveTasks() {
        localStorage.setItem('syncboard_tasks', JSON.stringify(tasks));
    }

    function renderBoard() {
        // Clear all columns first
        columns.forEach(column => column.innerHTML = '');

        // Distribute tasks to their respective columns
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            const column = document.getElementById(`${task.status}-list`);
            if (column) {
                column.appendChild(taskElement);
            }
        });
    }

    function createTaskElement(task) {
        const div = document.createElement('div');
        div.classList.add('task-card');
        div.setAttribute('draggable', 'true');
        div.dataset.id = task.id;

        div.innerHTML = `
            <span>${task.content}</span>
            <button class="delete-btn" aria-label="Delete task">&times;</button>
        `;

        // Drag Events
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);

        // Delete Event
        div.querySelector('.delete-btn').addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderBoard();
        });

        return div;
    }

    // --- Drag and Drop Logic ---

    let draggedItem = null;

    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedItem = null;
        saveTasks(); // Save the new state after dropping
    }

    columns.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault(); // Necessary to allow dropping
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', e => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            if (draggedItem) {
                column.appendChild(draggedItem);
                
                // Update the task's status in our data array
                const taskId = draggedItem.dataset.id;
                const newStatus = column.parentElement.dataset.column;
                
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex > -1) {
                    tasks[taskIndex].status = newStatus;
                }
            }
        });
    });

    // --- Add New Task ---

    addTaskBtn.addEventListener('click', () => {
        const content = taskInput.value.trim();
        if (content) {
            const newTask = {
                id: Date.now().toString(), // Simple unique ID
                content: content,
                status: 'todo' // Default column
            };
            
            tasks.push(newTask);
            saveTasks();
            renderBoard();
            taskInput.value = ''; // Clear input
        }
    });

    // Allow pressing "Enter" to add task
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTaskBtn.click();
    });

    // Initial Render
    renderBoard();
});