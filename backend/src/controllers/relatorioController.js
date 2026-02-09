// Controller de Relatórios
// Gera relatórios sobre execução de contratos

const RelatorioService = require('../services/relatorioService');

class RelatorioController {
  // GET /api/relatorios/geral - Relatório geral de todos os médicos
  async gerarRelatorioGeral(req, res) {
    try {
      const relatorio = await RelatorioService.gerarRelatorioGeral();
      res.json(relatorio);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  }

  // GET /api/relatorios/medico/:id - Relatório de um médico específico
  async gerarRelatorioPorMedico(req, res) {
    try {
      const { id } = req.params;
      const relatorio = await RelatorioService.gerarRelatorioPorMedico(id);
      res.json(relatorio);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

module.exports = new RelatorioController();
