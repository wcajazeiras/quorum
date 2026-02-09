require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Importar banco de dados (inicializa automaticamente)
require('./src/config/database');

// Importar rotas
const editaisRoutes = require('./src/routes/editaisRoutes');
const contratosRoutes = require('./src/routes/contratosRoutes');
const medicosRoutes = require('./src/routes/medicosRoutes');
const plantõesRoutes = require('./src/routes/plantõesRoutes');
const atendimentosRoutes = require('./src/routes/atendimentosRoutes');
const relatorioRoutes = require('./src/routes/relatorioRoutes');
const municipiosRoutes = require('./src/routes/municipiosRoutes');

// Middleware global
app.use(cors());
app.use(express.json());
// Servir novo frontend (AdminHub) primeiro, com fallback para /public
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.static('public'));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Registrar rotas
app.use('/api/editais', editaisRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/plantoes', plantõesRoutes);
app.use('/api/atendimentos', atendimentosRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/municipios', municipiosRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
  console.log(`✓ Frontend disponível em http://localhost:${PORT}`);
  console.log(`✓ API disponível em http://localhost:${PORT}/api`);
});
