require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const multer = require('multer');
const fs = require('fs');

// Importar banco de dados (inicializa automaticamente)
require('./src/config/database');

// Configurar uploads de fotos de médicos
const uploadDir = path.join(__dirname, 'uploads', 'medicos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const medicoFotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `medico_${req.params.id}${ext}`);
  }
});

const uploadMedicoFoto = multer({
  storage: medicoFotoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  }
});

// Importar rotas
const editaisRoutes = require('./src/routes/editaisRoutes');
const contratosRoutes = require('./src/routes/contratosRoutes');
const medicosRoutes = require('./src/routes/medicosRoutes');
const plantõesRoutes = require('./src/routes/plantõesRoutes');
const atendimentosRoutes = require('./src/routes/atendimentosRoutes');
const relatorioRoutes = require('./src/routes/relatorioRoutes');
const municipiosRoutes = require('./src/routes/municipiosRoutes');
const pncpRoutes = require('./src/routes/pncpRoutes');

// Middleware global
app.use(cors());
app.use(express.json());
// Servir novo frontend (AdminHub) primeiro, com fallback para /public
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Registrar rotas
app.use('/api/editais', editaisRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/medicos', medicosRoutes);

// Upload de foto de médico
const Medico = require('./src/models/Medico');
app.post('/api/medicos/:id/foto', uploadMedicoFoto.single('foto'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ erro: 'Nenhuma imagem enviada' });
    const fotoPath = `/uploads/medicos/${req.file.filename}`;
    await Medico.atualizarFoto(req.params.id, fotoPath);
    res.json({ foto: fotoPath });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
app.use('/api/plantoes', plantõesRoutes);
app.use('/api/atendimentos', atendimentosRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/municipios', municipiosRoutes);
app.use('/api/pncp', pncpRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
  console.log(`✓ Frontend disponível em http://localhost:${PORT}`);
  console.log(`✓ API disponível em http://localhost:${PORT}/api`);
});
