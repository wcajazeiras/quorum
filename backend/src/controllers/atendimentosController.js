// Controller de Atendimentos
// Recebe requisições HTTP e chama os serviços

const AtendimentosService = require('../services/atendimentosService');

class AtendimentosController {
  // GET /api/atendimentos - Listar todos os atendimentos
  async listar(req, res) {
    try {
      const atendimentos = await AtendimentosService.listarAtendimentos();
      res.json(atendimentos);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  }

  // POST /api/atendimentos - Criar novo atendimento
  async criar(req, res) {
    try {
      const { medicoId, data, descricao } = req.body;
      const atendimento = await AtendimentosService.criarAtendimento(medicoId, data, descricao);
      res.status(201).json(atendimento);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // GET /api/atendimentos/medico/:id - Buscar atendimentos de um médico
  async buscarPorMedico(req, res) {
    try {
      const { id } = req.params;
      const atendimentos = await AtendimentosService.buscarAtendimentosPorMedico(id);
      res.json(atendimentos);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // DELETE /api/atendimentos/:id - Deletar atendimento
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await AtendimentosService.deletarAtendimento(id);
      res.json(resultado);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

module.exports = new AtendimentosController();
