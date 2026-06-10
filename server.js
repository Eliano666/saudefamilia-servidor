const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Ligar ao MySQL
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '1234567890',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'saudefamilia'
});

db.connect((err) => {
  if (err) {
    console.log('Erro ao ligar ao MySQL:', err);
  } else {
    console.log('MySQL ligado com sucesso!');
  }
});

// Rotas
const authRoutes = require('./routes/auth')(db);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor na porta ' + PORT);
});