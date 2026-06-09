const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (db) => {

  // Cadastro
  router.post('/cadastro', async (req, res) => {
    try {
      const { nome, email, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      db.query(
        'INSERT INTO usuarios (nome, email, password) VALUES (?, ?, ?)',
        [nome, email, hashPassword],
        (err, result) => {
          if (err) return res.status(400).json({ mensagem: 'Email já existe' });
          res.status(201).json({ mensagem: 'Utilizador criado com sucesso' });
        }
      );
    } catch (err) {
      res.status(500).json({ mensagem: 'Erro no servidor' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

 db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
          return res.status(400).json({ mensagem: 'Email ou password incorrectos' });
        }

        const user = results[0];
        const passwordCorrecta = await bcrypt.compare(password, user.password);
        if (!passwordCorrecta) {
          return res.status(400).json({ mensagem: 'Email ou password incorrectos' });
        }

        const token = jwt.sign(
          { id: user.id, role: user.role },
          'saudefamilia_secret',
          { expiresIn: '7d' }
        );

        res.json({ token, role: user.role, nome: user.nome });
      });
    } catch (err) {
      res.status(500).json({ mensagem: 'Erro no servidor' });
    }
  });

  return router;
};