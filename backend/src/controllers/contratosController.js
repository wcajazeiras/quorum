// Controller de Contratos
// Recebe requisições HTTP e chama os serviços

const ContratosService = require('../services/contratosService');

class ContratosController {
  // GET /api/contratos - Listar todos os contratos
  async listar(req, res) {
    try {
      const contratos = await ContratosService.listarContratos();
      res.json(contratos);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  }

  // POST /api/contratos - Criar novo contrato
  async criar(req, res) {
    try {
      const { editalId, dataInicio, dataFim } = req.body;
      const contrato = await ContratosService.criarContrato(editalId, dataInicio, dataFim);
      res.status(201).json(contrato);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // GET /api/contratos/:id - Buscar contrato por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratosService.buscarContratosPorId(id);
      res.json(contrato);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // DELETE /api/contratos/:id - Deletar contrato
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await ContratosService.deletarContrato(id);
      res.json(resultado);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

module.exports = new ContratosController();
