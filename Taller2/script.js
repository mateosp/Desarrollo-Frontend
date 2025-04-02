document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
    const completedTaskList = document.getElementById("completed-task-list");

    // 🔹 Cargar tareas al inicio
    async function loadTasks() {
        try {
            const res = await fetch("http://localhost:3000/tasks");
            const tasks = await res.json();
            
            taskList.innerHTML = "";
            completedTaskList.innerHTML = "";

            tasks.forEach(task => {
                if (task.completed) {
                    renderTask(task, completedTaskList);
                } else {
                    renderTask(task, taskList);
                }
            });
        } catch (error) {
            console.error("Error al cargar tareas:", error);
        }
    }

    // 🔹 Renderizar una tarea
    function renderTask(task, list) {
        const li = document.createElement("li");
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <span class="task-text">${task.title}</span>
            <input type="text" class="edit-input" value="${task.title}" style="display: none;">
            ${task.completed ? "" : `<button class="complete-btn" data-id="${task.id}">✅</button>`}
            <button class="save-btn" data-id="${task.id}" style="display: none;">💾</button>
            <button class="delete-btn" data-id="${task.id}">❌</button>
        `;
        
        // Agregar event listeners directamente a los botones
        const completeBtn = li.querySelector('.complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => completeTask(task.id));
        }
        
        const saveBtn = li.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => saveTask(task.id, saveBtn));
        }
        
        
        const deleteBtn = li.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        }
        
        list.appendChild(li);
    }

    // 🔹 Agregar nueva tarea
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        if (!title) return;

        try {
            const res = await fetch("http://localhost:3000/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });

            if (res.ok) {
                const newTask = await res.json();
                taskInput.value = "";
                renderTask(newTask, taskList);
            }
        } catch (error) {
            console.error("Error al agregar tarea:", error);
        }
    });

    // 🔹 Marcar como completada
    async function completeTask(id) {
        try {
            const res = await fetch(`http://localhost:3000/tasks/${id}`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: true })
            });

            if (res.ok) {
                const taskElement = document.querySelector(`li[data-id="${id}"]`);
                if (taskElement) {
                    taskElement.remove();
                    const task = await res.json();
                    renderTask(task, completedTaskList);
                }
            }
        } catch (error) {
            console.error("Error al completar tarea:", error);
        }
    }

    // 🔹 Eliminar tarea
    async function deleteTask(id) {
        try {
            const res = await fetch(`http://localhost:3000/tasks/${id}`, { 
                method: "DELETE" 
            });

            if (res.ok) {
                const taskElement = document.querySelector(`li[data-id="${id}"]`);
                if (taskElement) {
                    taskElement.remove();
                }
            }
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
        }
    }

    // 🔹 Guardar tarea editada
    async function saveTask(id, btn) {
        const li = btn.parentElement;
        const input = li.querySelector(".edit-input");
        const newTitle = input.value.trim();

        if (!newTitle) {
            alert("¡El título de la tarea no puede estar vacío!");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle })
            });

            if (res.ok) {
                const taskText = li.querySelector(".task-text");
                taskText.textContent = newTitle;
                input.style.display = "none";
                btn.style.display = "none";
                
                // Mostrar el botón de editar nuevamente
                const editBtn = li.querySelector(".edit-btn");
                if (editBtn) {
                    editBtn.style.display = "inline-block";
                }
            } else {
                const error = await res.json();
                alert(error.message || "Hubo un error al guardar la tarea");
            }
        } catch (error) {
            console.error("Error al guardar tarea:", error);
        }
    }

    // 🔹 Iniciar edición de tarea
    function editTask(btn) {
        const li = btn.parentElement;
        const taskText = li.querySelector(".task-text");
        const input = li.querySelector(".edit-input");
        const saveBtn = li.querySelector(".save-btn");

        taskText.style.display = "none";
        input.style.display = "block";
        saveBtn.style.display = "inline-block";
        btn.style.display = "none";
    }

    // Cargar tareas al iniciar
    loadTasks();
});
