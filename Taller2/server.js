const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar a la base de datos SQLite
const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) console.error("Error al abrir la base de datos", err);
  else {
    db.run(
      "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, completed INTEGER DEFAULT 0)",
      (err) => {
        if (err) console.error("Error creando la tabla", err);
      }
    );
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor corriendo...");
});

// Obtener todas las tareas
app.get("/tasks", (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    });
});

// Crear nueva tarea
app.post("/tasks", (req, res) => {
    const { title } = req.body;
    db.run("INSERT INTO tasks (title) VALUES (?)", [title], function (err) {
      if (err) res.status(500).json({ error: err.message });
      else {
        // Devolver la tarea completa recién creada
        db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, row) => {
          if (err) res.status(500).json({ error: err.message });
          else res.json(row);
        });
      }
    });
});

// Completar tarea
app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.run("UPDATE tasks SET completed = 1 WHERE id = ?", [id], function (err) {
      if (err) res.status(500).json({ error: err.message });
      else {
        // Devolver la tarea actualizada
        db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
          if (err) res.status(500).json({ error: err.message });
          else res.json(row);
        });
      }
    });
});

// Eliminar tarea
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: parseInt(id), deleted: true });
    });
});

// Actualizar título de tarea
app.patch("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    
    db.run("UPDATE tasks SET title = ? WHERE id = ?", [title, id], function (err) {
      if (err) res.status(500).json({ error: err.message });
      else {
        // Devolver la tarea actualizada
        db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
          if (err) res.status(500).json({ error: err.message });
          else res.json(row);
        });
      }
    });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
