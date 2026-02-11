// Controller de Plantões
// Recebe requisições HTTP e chama os serviços

const PlantõesService = require('../services/plantõesService');

class PlantõesController {
  // GET /api/plantoes - Listar todos os plantões
  async listar(req, res) {
    try {
      const plantoes = await PlantõesService.listarPlantoes();
      res.json(plantoes);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  }

  // POST /api/plantoes - Criar novo plantão
  async criar(req, res) {
    try {
      const { medicoId, data, cargaHoraria } = req.body;
      const plantao = await PlantõesService.criarPlantao(medicoId, data, cargaHoraria);
      res.status(201).json(plantao);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // GET /api/plantoes/medico/:id - Buscar plantões de um médico
  async buscarPorMedico(req, res) {
    try {
      const { id } = req.params;
      const plantoes = await PlantõesService.buscarPlantoesPorMedico(id);
      res.json(plantoes);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // PUT /api/plantoes/:id - Atualizar plantão
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { medicoId, data, cargaHoraria } = req.body;
      const plantao = await PlantõesService.atualizarPlantao(id, medicoId, data, cargaHoraria);
      res.json(plantao);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // DELETE /api/plantoes/:id - Deletar plantão
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await PlantõesService.deletarPlantao(id);
      res.json(resultado);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

module.exports = new PlantõesController();
