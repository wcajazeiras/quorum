// Rotas de Editais
// Define os endpoints para gerenciar editais

const express = require('express');
const router = express.Router();
const editaisController = require('../controllers/editaisController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/editais - Listar todos
router.get('/', editaisController.listar);

// POST /api/editais - Criar novo
router.post('/', editaisController.criar);

// POST /api/editais/analisar - Analisar PDF
router.post('/analisar', upload.single('editalPdf'), editaisController.analisar);

// GET /api/editais/:id - Buscar por ID
router.get('/:id', editaisController.buscarPorId);

// PUT /api/editais/:id - Atualizar
router.put('/:id', editaisController.atualizar);

// DELETE /api/editais/:id - Deletar
router.delete('/:id', editaisController.deletar);

module.exports = router;
