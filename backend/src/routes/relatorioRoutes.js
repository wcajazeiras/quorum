// Rotas de Relatórios
// Define os endpoints para gerar relatórios

const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

// GET /api/relatorios/geral - Relatório geral
router.get('/geral', relatorioController.gerarRelatorioGeral);

// GET /api/relatorios/medico/:id - Relatório de um médico
router.get('/medico/:id', relatorioController.gerarRelatorioPorMedico);

module.exports = router;
