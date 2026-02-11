// Controller de Médicos
// Recebe requisições HTTP e chama os serviços

const MedicosService = require('../services/medicosService');

class MedicosController {
  // GET /api/medicos - Listar todos os médicos
  async listar(req, res) {
    try {
      const medicos = await MedicosService.listarMedicos();
      res.json(medicos);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  }

  // POST /api/medicos - Criar novo médico
  async criar(req, res) {
    try {
      const { nome, especialidade } = req.body;
      const medico = await MedicosService.criarMedico(nome, especialidade);
      res.status(201).json(medico);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // GET /api/medicos/:id - Buscar médico por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const medico = await MedicosService.buscarMedicoPorId(id);
      res.json(medico);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // DELETE /api/medicos/:id - Deletar médico
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await MedicosService.deletarMedico(id);
      res.json(resultado);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

module.exports = new MedicosController();
