const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = 'saudefamilia_secret';

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token de autorização em falta' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensagem: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = (db) => {
  router.use(authenticateToken);

  // Criar membro
  router.post('/', (req, res) => {
    const { nome, data_nascimento, sexo, alergias } = req.body;
    const utilizador_id = req.user.id;

    db.query(
      'INSERT INTO membros (utilizador_id, nome, data_nascimento, sexo, alergias) VALUES (?, ?, ?, ?, ?)',
      [utilizador_id, nome, data_nascimento, sexo, alergias],
      (err, result) => {
        if (err) {
          return res.status(500).json({ mensagem: 'Erro ao criar membro' });
        }
        res.status(201).json({ mensagem: 'Membro criado com sucesso', id: result.insertId });
      }
    );
  });

  // Listar membros do utilizador
  router.get('/', (req, res) => {
    const utilizador_id = req.user.id;

    db.query(
      'SELECT id, nome, data_nascimento, sexo, alergias FROM membros WHERE utilizador_id = ?',
      [utilizador_id],
      (err, results) => {
        if (err) {
          return res.status(500).json({ mensagem: 'Erro ao listar membros' });
        }
        res.json(results);
      }
    );
  });

  // Editar membro
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, sexo, alergias } = req.body;
    const utilizador_id = req.user.id;

    db.query(
      'UPDATE membros SET nome = ?, data_nascimento = ?, sexo = ?, alergias = ? WHERE id = ? AND utilizador_id = ?',
      [nome, data_nascimento, sexo, alergias, id, utilizador_id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ mensagem: 'Erro ao atualizar membro' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ mensagem: 'Membro não encontrado' });
        }
        res.json({ mensagem: 'Membro atualizado com sucesso' });
      }
    );
  });

  // Apagar membro
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const utilizador_id = req.user.id;

    db.query(
      'DELETE FROM membros WHERE id = ? AND utilizador_id = ?',
      [id, utilizador_id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ mensagem: 'Erro ao apagar membro' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ mensagem: 'Membro não encontrado' });
        }
        res.json({ mensagem: 'Membro apagado com sucesso' });
      }
    );
  });

  return router;
};
