// Rotas de Editais
// Define os endpoints para gerenciar editais

const express = require('express');
const router = express.Router();
const editaisController = require('../controllers/editaisController');

// GET /api/editais - Listar todos
router.get('/', editaisController.listar);

// POST /api/editais - Criar novo
router.post('/', editaisController.criar);

// GET /api/editais/:id - Buscar por ID
router.get('/:id', editaisController.buscarPorId);

// DELETE /api/editais/:id - Deletar
router.delete('/:id', editaisController.deletar);

module.exports = router;
