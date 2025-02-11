const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // El puerto que se usará en Vercel

// Habilitar CORS para permitir solicitudes de otros dominios (como GitHub Pages)
app.use(cors());
app.use(express.json()); // Parsear JSON en el cuerpo de las peticiones

// Conexión a la base de datos
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cEGKt3M1UZVd@ep-gentle-wave-a46mqehq-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Ruta para crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
  const { nombres, correo, celular, numero_doc, contraseña, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombres, correo, celular, numero_doc, contraseña, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombres, correo, celular, numero_doc, contraseña, estado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Ruta para actualizar un usuario
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombres, correo, celular, numero_doc, contraseña, estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombres = $1, correo = $2, celular = $3, numero_doc = $4, contraseña = $5, estado = $6 WHERE id = $7 RETURNING *',
      [nombres, correo, celular, numero_doc, contraseña, estado, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Ruta para eliminar un usuario
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length > 0) {
      res.json({ message: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
