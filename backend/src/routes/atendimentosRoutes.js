// Rotas de Atendimentos
// Define os endpoints para gerenciar atendimentos

const express = require('express');
const router = express.Router();
const atendimentosController = require('../controllers/atendimentosController');

// GET /api/atendimentos - Listar todos
router.get('/', atendimentosController.listar);

// POST /api/atendimentos - Criar novo
router.post('/', atendimentosController.criar);

// GET /api/atendimentos/medico/:id - Buscar atendimentos de um médico
router.get('/medico/:id', atendimentosController.buscarPorMedico);

// DELETE /api/atendimentos/:id - Deletar
router.delete('/:id', atendimentosController.deletar);

module.exports = router;
