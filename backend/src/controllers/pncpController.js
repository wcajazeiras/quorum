// Controller para integração com o PNCP
const PncpService = require('../services/pncpService');

const pncpController = {
  /**
   * GET /api/pncp/contratacoes
   * Buscar contratações por data de publicação no PNCP
   */
  async buscarContratacoes(req, res) {
    try {
      const { dataInicial, dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj, pagina, tamanhoPagina } = req.query;

      if (!dataInicial || !dataFinal) {
        return res.status(400).json({ erro: 'Parâmetros obrigatórios: dataInicial, dataFinal' });
      }

      const resultado = await PncpService.buscarContratacoes({
        dataInicial, dataFinal,
        codigoModalidadeContratacao,
        uf, codigoMunicipioIbge, cnpj,
        pagina: pagina || 1,
        tamanhoPagina: tamanhoPagina || 15
      });

      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar contratações PNCP:', error.message);
      res.status(502).json({ erro: 'Falha ao consultar PNCP', detalhe: error.message });
    }
  },

  /**
   * GET /api/pncp/propostas
   * Buscar contratações com propostas abertas no PNCP
   */
  async buscarPropostas(req, res) {
    try {
      const { dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj, pagina, tamanhoPagina } = req.query;

      if (!dataFinal) {
        return res.status(400).json({ erro: 'Parâmetro obrigatório: dataFinal' });
      }

      const resultado = await PncpService.buscarPropostasAbertas({
        dataFinal,
        codigoModalidadeContratacao,
        uf, codigoMunicipioIbge, cnpj,
        pagina: pagina || 1,
        tamanhoPagina: tamanhoPagina || 15
      });

      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar propostas PNCP:', error.message);
      res.status(502).json({ erro: 'Falha ao consultar PNCP', detalhe: error.message });
    }
  },

  /**
   * GET /api/pncp/contratacao/:cnpj/:ano/:sequencial
   * Consultar detalhes de uma contratação específica no PNCP
   */
  async buscarContratacao(req, res) {
    try {
      const { cnpj, ano, sequencial } = req.params;
      const resultado = await PncpService.buscarContratacao(cnpj, ano, sequencial);

      if (!resultado) {
        return res.status(404).json({ erro: 'Contratação não encontrada' });
      }

      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar contratação PNCP:', error.message);
      res.status(502).json({ erro: 'Falha ao consultar PNCP', detalhe: error.message });
    }
  },

  /**
   * GET /api/pncp/modalidades
   * Retorna a lista de modalidades disponíveis
   */
  getModalidades(req, res) {
    const modalidades = PncpService.getModalidades();
    const lista = Object.entries(modalidades).map(([codigo, nome]) => ({ codigo: Number(codigo), nome }));
    res.json(lista);
  },

  /**
   * POST /api/pncp/normalizar
   * Normaliza dados PNCP para formato de edital Quorum
   */
  normalizar(req, res) {
    try {
      const contratacao = req.body;
      if (!contratacao) {
        return res.status(400).json({ erro: 'Body com dados da contratação é obrigatório' });
      }
      const normalizado = PncpService.normalizarParaEdital(contratacao);
      res.json(normalizado);
    } catch (error) {
      console.error('Erro ao normalizar contratação:', error.message);
      res.status(500).json({ erro: 'Falha ao normalizar dados', detalhe: error.message });
    }
  }
};

module.exports = pncpController;
