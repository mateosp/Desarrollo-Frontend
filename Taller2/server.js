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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


app.get("/tasks", (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    });
  });

  
app.post("/tasks", (req, res) => {
    const { title } = req.body;
    db.run("INSERT INTO tasks (title) VALUES (?)", [title], function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID, title, completed: 0 });
    });
});
  

app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.run("UPDATE tasks SET completed = 1 WHERE id = ?", [id], function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ message: "Tarea completada" });
    });
});

app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ message: "Tarea eliminada" });
    });
});
  

// PATCH para actualizar una tarea
app.patch("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const query = "UPDATE tasks SET title = ? WHERE id = ?";
    const params = [title, id];
    
    db.run(query, params, function (err) {
        if (err) {
            return res.status(500).json({ message: "Error al actualizar la tarea." });
        }

        // Si todo está bien, respondemos con el mensaje de éxito
        res.status(200).json({ message: "Tarea actualizada correctamente" });
    });
});
