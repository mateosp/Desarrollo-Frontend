document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
    const completedTaskList = document.getElementById("completed-task-list");
    const deleteAllBtn = document.getElementById("delete-all-btn");
    const sortTasksBtn = document.getElementById("sort-tasks-btn");
    
    // 🔹 Cargar tareas al inicio
    async function loadTasks() {
        try {
            console.log("Intentando cargar tareas...");
            const res = await fetch("http://localhost:3000/tasks");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const tasks = await res.json();
            console.log("Tareas cargadas:", tasks);
            
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
            alert("Error al cargar las tareas. Por favor, asegúrate de que el servidor esté corriendo en http://localhost:3000");
        }
    }

    // 🔹 Renderizar una tarea
    function renderTask(task, list) {
        // Crear el elemento li
        const li = document.createElement("li");
        li.dataset.id = task.id;
        
        // Crear los elementos internos
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.title;
        
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.className = "edit-input";
        editInput.value = task.title;
        editInput.style.display = "none";
        
        // Agregar los elementos al li
        li.appendChild(taskText);
        li.appendChild(editInput);
        
        // Agregar botones según el estado de la tarea
        if (!task.completed) {
            const completeBtn = document.createElement("button");
            completeBtn.className = "complete-btn";
            completeBtn.textContent = "✅";
            completeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                completeTask(task.id);
            });
            li.appendChild(completeBtn);
        }
        
        const saveBtn = document.createElement("button");
        saveBtn.className = "save-btn";
        saveBtn.textContent = "💾";
        saveBtn.style.display = "none";
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveTask(task.id, saveBtn);
        });
        li.appendChild(saveBtn);
        
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "✏️";
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editTask(editBtn);
        });
        li.appendChild(editBtn);
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            deleteTask(task.id);
        });
        li.appendChild(deleteBtn);
        
        // Agregar el li a la lista
        list.appendChild(li);
    }

    // 🔹 Agregar nueva tarea
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        if (!title) return;

        try {
            console.log("Intentando agregar tarea:", title);
            const res = await fetch("http://localhost:3000/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const newTask = await res.json();
            console.log("Tarea agregada:", newTask);
            taskInput.value = "";
            renderTask(newTask, taskList);
        } catch (error) {
            console.error("Error al agregar tarea:", error);
            alert("Error al agregar la tarea. Por favor, asegúrate de que el servidor esté corriendo en http://localhost:3000");
        }
    });

    // 🔹 Marcar como completada
    async function completeTask(id) {
        try {
            console.log("Intentando completar tarea:", id);
            const res = await fetch(`http://localhost:3000/tasks/${id}`, { 
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: true })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const taskElement = document.querySelector(`li[data-id="${id}"]`);
            if (taskElement) {
                taskElement.remove();
                const task = await res.json();
                console.log("Tarea completada:", task);
                renderTask(task, completedTaskList);
            }
        } catch (error) {
            console.error("Error al completar tarea:", error);
            alert("Error al completar la tarea. Por favor, asegúrate de que el servidor esté corriendo en http://localhost:3000");
        }
    }

    // 🔹 Eliminar tarea
    async function deleteTask(id) {
        try {
            console.log("Intentando eliminar tarea:", id);
            const res = await fetch(`http://localhost:3000/tasks/${id}`, { 
                method: "DELETE" 
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const taskElement = document.querySelector(`li[data-id="${id}"]`);
            if (taskElement) {
                taskElement.remove();
                console.log("Tarea eliminada:", id);
            }
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
            alert("Error al eliminar la tarea. Por favor, asegúrate de que el servidor esté corriendo en http://localhost:3000");
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
            console.log("Intentando guardar tarea:", id, newTitle);
            const res = await fetch(`http://localhost:3000/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const taskText = li.querySelector(".task-text");
            taskText.textContent = newTitle;
            input.style.display = "none";
            btn.style.display = "none";
            const editBtn = li.querySelector(".edit-btn");
            if (editBtn) {
                editBtn.style.display = "inline-block";
            }
            console.log("Tarea guardada:", id, newTitle);
        } catch (error) {
            console.error("Error al guardar tarea:", error);
            alert("Error al guardar la tarea. Por favor, asegúrate de que el servidor esté corriendo en http://localhost:3000");
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
        btn.style.display = "none";
        saveBtn.style.display = "inline-block";
        input.focus();
    }

    // 🔹 Eliminar todas las tareas
    deleteAllBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (confirm("¿Estás seguro de que deseas eliminar todas las tareas? Esta acción no se puede deshacer.")) {
            try {
                const res = await fetch("http://localhost:3000/tasks");
                const tasks = await res.json();
                
                for (const task of tasks) {
                    await fetch(`http://localhost:3000/tasks/${task.id}`, {
                        method: "DELETE"
                    });
                }
                
                taskList.innerHTML = "";
                completedTaskList.innerHTML = "";
            } catch (error) {
                console.error("Error al eliminar todas las tareas:", error);
            }
        }
    });

    sortTasksBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        // Obtener todas las tareas pendientes y completadas
        const pendingTasks = Array.from(taskList.children);
        const completedTasks = Array.from(completedTaskList.children);

        // Función para ordenar tareas alfabéticamente
        const sortTasksAlphabetically = (tasks) => {
            return tasks.sort((a, b) => {
                const textA = a.querySelector('.task-text').textContent.toLowerCase();
                const textB = b.querySelector('.task-text').textContent.toLowerCase();
                return textA.localeCompare(textB);
            });
        };

        // Ordenar las tareas
        const sortedPendingTasks = sortTasksAlphabetically(pendingTasks);
        const sortedCompletedTasks = sortTasksAlphabetically(completedTasks);

        // Limpiar las listas actuales
        taskList.innerHTML = '';
        completedTaskList.innerHTML = '';

        // Agregar las tareas ordenadas de vuelta a las listas
        sortedPendingTasks.forEach(task => taskList.appendChild(task));
        sortedCompletedTasks.forEach(task => completedTaskList.appendChild(task));
    });

    // Cargar tareas al iniciar
    loadTasks();
});
