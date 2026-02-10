// Rotas de integração com o PNCP
const express = require('express');
const router = express.Router();
const pncpController = require('../controllers/pncpController');

// GET /api/pncp/modalidades - Lista de modalidades
router.get('/modalidades', pncpController.getModalidades);

// GET /api/pncp/contratacoes - Buscar contratações por publicação
router.get('/contratacoes', pncpController.buscarContratacoes);

// GET /api/pncp/propostas - Buscar contratações com propostas abertas
router.get('/propostas', pncpController.buscarPropostas);

// GET /api/pncp/contratacao/:cnpj/:ano/:sequencial - Detalhe de contratação
router.get('/contratacao/:cnpj/:ano/:sequencial', pncpController.buscarContratacao);

// POST /api/pncp/normalizar - Normalizar dados PNCP para edital Quorum
router.post('/normalizar', pncpController.normalizar);

module.exports = router;
