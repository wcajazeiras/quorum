// Rotas de Médicos
// Define os endpoints para gerenciar médicos

const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');

// GET /api/medicos - Listar todos
router.get('/', medicosController.listar);

// POST /api/medicos - Criar novo
router.post('/', medicosController.criar);

// GET /api/medicos/:id - Buscar por ID
router.get('/:id', medicosController.buscarPorId);

// DELETE /api/medicos/:id - Deletar
router.delete('/:id', medicosController.deletar);

module.exports = router;
