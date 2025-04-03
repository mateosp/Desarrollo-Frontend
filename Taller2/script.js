document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
    const completedTaskList = document.getElementById("completed-task-list");
    const deleteAllBtn = document.getElementById("delete-all-btn");

    // 🔹 Cargar tareas al inicio
    async function loadTasks() {
        try {
            const res = await fetch("http://localhost:3000/tasks");
            const tasks = await res.json();
            
            // Limpiar las listas solo una vez al inicio
            taskList.innerHTML = "";
            completedTaskList.innerHTML = "";

            // Renderizar todas las tareas
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
            completeBtn.addEventListener('click', () => completeTask(task.id));
            li.appendChild(completeBtn);
        }
        
        const saveBtn = document.createElement("button");
        saveBtn.className = "save-btn";
        saveBtn.textContent = "💾";
        saveBtn.style.display = "none";
        saveBtn.addEventListener('click', () => saveTask(task.id, saveBtn));
        li.appendChild(saveBtn);
        
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "✏️";
        editBtn.addEventListener('click', () => editTask(editBtn));
        li.appendChild(editBtn);
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "❌";
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
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
                    // Obtener la tarea actualizada del servidor
                    const task = await res.json();
                    
                    // Eliminar la tarea de la lista actual
                    taskElement.remove();
                    
                    // Agregar la tarea a la lista de completadas
                    renderTask(task, completedTaskList);
                }
            }
        } catch (error) {
            console.error("Error al completar tarea:", error);
        }
        loadTasks();
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
                    // Eliminar la tarea del DOM
                    taskElement.remove();
                }
            }
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
        }
        loadTasks();
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
                // Actualizar el texto de la tarea en el DOM
                const taskText = li.querySelector(".task-text");
                taskText.textContent = newTitle;
                
                // Ocultar el input y el botón de guardar
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

        loadTasks();
    }

    // 🔹 Iniciar edición de tarea
    function editTask(btn) {
        const li = btn.parentElement;
        const taskText = li.querySelector(".task-text");
        const input = li.querySelector(".edit-input");
        const saveBtn = li.querySelector(".save-btn");

        // Ocultar el texto y mostrar el input
        taskText.style.display = "none";
        input.style.display = "block";
        
        // Ocultar el botón de editar y mostrar el de guardar
        btn.style.display = "none";
        saveBtn.style.display = "inline-block";
        
        // Enfocar el input
        input.focus();
    }

    // 🔹 Eliminar todas las tareas
    deleteAllBtn.addEventListener("click", async () => {
        // Confirmar antes de eliminar todas las tareas
        if (confirm("¿Estás seguro de que deseas eliminar todas las tareas? Esta acción no se puede deshacer.")) {
            try {
                // Obtener todas las tareas
                const res = await fetch("http://localhost:3000/tasks");
                const tasks = await res.json();
                
                // Eliminar cada tarea
                for (const task of tasks) {
                    await fetch(`http://localhost:3000/tasks/${task.id}`, {
                        method: "DELETE"
                    });
                }
                
                // Limpiar las listas en el DOM
                taskList.innerHTML = "";
                completedTaskList.innerHTML = "";
                
                // Mostrar mensaje de éxito
                alert("Todas las tareas han sido eliminadas correctamente.");
            } catch (error) {
                console.error("Error al eliminar todas las tareas:", error);
                alert("Hubo un error al eliminar todas las tareas. Por favor, intenta de nuevo.");
            }
        }
    });

    // Cargar tareas al iniciar
    loadTasks();
});
