// Rotas de Plantões
// Define os endpoints para gerenciar plantões

const express = require('express');
const router = express.Router();
const plantõesController = require('../controllers/plantõesController');

// GET /api/plantoes - Listar todos
router.get('/', plantõesController.listar);

// POST /api/plantoes - Criar novo
router.post('/', plantõesController.criar);

// GET /api/plantoes/medico/:id - Buscar plantões de um médico
router.get('/medico/:id', plantõesController.buscarPorMedico);

// PUT /api/plantoes/:id - Atualizar
router.put('/:id', plantõesController.atualizar);

// DELETE /api/plantoes/:id - Deletar
router.delete('/:id', plantõesController.deletar);

module.exports = router;
