document.addEventListener("DOMContentLoaded", () => {
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
    const completedTaskList = document.getElementById("completed-task-list");

    // 🔹 Cargar tareas al inicio
    async function loadTasks() {
        const res = await fetch("http://localhost:3000/tasks");
        const tasks = await res.json();
        
        taskList.innerHTML = "";
        completedTaskList.innerHTML = ""; // Limpiar listas

        tasks.forEach(task => {
            if (task.completed) {
                renderTask(task, completedTaskList);
            } else {
                renderTask(task, taskList);
            }
        });
    }

    // 🔹 Renderizar una tarea
    function renderTask(task, list) {
        const li = document.createElement("li");
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <span class="task-text">${task.title}</span>
            <input type="text" class="edit-input" value="${task.title}" style="display: none;">
            ${task.completed ? "" : `<button class="complete-btn" onclick="completeTask(${task.id})">✅</button>`}
            <button class="edit-btn" onclick="editTask(${task.id}, this)">✏</button>
            <button class="save-btn" onclick="saveTask(${task.id}, this)" style="display: none;">💾</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">❌</button>
        `;
        list.appendChild(li);
    }

    // 🔹 Agregar nueva tarea
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        if (!title) return;

        const res = await fetch("http://localhost:3000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        });

        if (res.ok) {
            taskInput.value = "";
            loadTasks(); // Recargar lista
        }
    });

    // 🔹 Marcar como completada
    window.completeTask = async (id) => {
        await fetch(`http://localhost:3000/tasks/${id}`, { method: "PUT" });
        loadTasks(); // Recargar lista
    };

    // 🔹 Eliminar tarea
    window.deleteTask = async (id) => {
        await fetch(`http://localhost:3000/tasks/${id}`, { method: "DELETE" });
        loadTasks(); // Recargar lista
    };

    // 🔹 Editar tarea (mostrar input)
    window.editTask = (id, btn) => {
        const li = btn.parentElement;
        const span = li.querySelector(".task-text");
        const input = li.querySelector(".edit-input");
        const saveBtn = li.querySelector(".save-btn");

        span.style.display = "none";
        btn.style.display = "none";
        input.style.display = "inline";
        saveBtn.style.display = "inline";
    };

    // 🔹 Guardar tarea editada
    // 🔹 Guardar tarea editada
    window.saveTask = async (id, btn) => {
        const li = btn.parentElement;
        const input = li.querySelector(".edit-input");
        const newTitle = input.value.trim();

        if (!newTitle) {
            alert("¡El título de la tarea no puede estar vacío!");
            return;
        }

        // Hacer la solicitud PATCH para actualizar la tarea
        try {
            const res = await fetch(`http://localhost:3000/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle })  // Enviar el nuevo título
            });

            if (res.ok) {
                loadTasks();  // Recargar tareas después de editar
            } else {
                const error = await res.json();
                alert(error.message || "Hubo un error al guardar la tarea");
            }
        } catch (error) {
            console.error("Error al guardar tarea:", error);
        }
    };


    loadTasks(); // Cargar tareas al iniciar
});
