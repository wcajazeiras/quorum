// Rotas de Contratos
// Define os endpoints para gerenciar contratos

const express = require('express');
const router = express.Router();
const contratosController = require('../controllers/contratosController');

// GET /api/contratos - Listar todos
router.get('/', contratosController.listar);

// POST /api/contratos - Criar novo
router.post('/', contratosController.criar);

// GET /api/contratos/:id - Buscar por ID
router.get('/:id', contratosController.buscarPorId);

// DELETE /api/contratos/:id - Deletar
router.delete('/:id', contratosController.deletar);

module.exports = router;
