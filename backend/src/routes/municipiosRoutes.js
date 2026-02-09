const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

let municipios = null;

// Cache de municípios em memória
function carregarMunicipios() {
    if (!municipios) {
        const filePath = path.join(__dirname, '../../data/municipios.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        municipios = JSON.parse(data);
    }
    return municipios;
}

// GET todos os municípios
router.get('/', (req, res) => {
    try {
        const mun = carregarMunicipios();
        res.json(mun);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao carregar municípios' });
    }
});

// GET municípios de um estado específico
router.get('/estado/:uf', (req, res) => {
    try {
        const mun = carregarMunicipios();
        const uf = req.params.uf.toUpperCase();
        
        if (!mun[uf]) {
            return res.status(404).json({ erro: 'Estado não encontrado' });
        }
        
        res.json({ estado: uf, municipios: mun[uf] });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao carregar municípios' });
    }
});

module.exports = router;
