// Serviço de Contratos
// Contém a lógica de negócio para contratos

const Contrato = require('../models/Contrato');

class ContratosService {
  // Criar contrato com validações
  async criarContrato(editalId, dataInicio, dataFim) {
    // Validar campos obrigatórios
    if (!editalId || !dataInicio || !dataFim) {
      throw new Error('Edital, data de início e data de fim são obrigatórios');
    }

    // Validar datas
    if (new Date(dataInicio) >= new Date(dataFim)) {
      throw new Error('Data de início deve ser menor que data de fim');
    }

    try {
      const contrato = await Contrato.criar(editalId, dataInicio, dataFim);
      return contrato;
    } catch (erro) {
      throw new Error(`Erro ao criar contrato: ${erro.message}`);
    }
  }

  // Listar todos os contratos
  async listarContratos() {
    try {
      const contratos = await Contrato.listar();
      return contratos;
    } catch (erro) {
      throw new Error(`Erro ao listar contratos: ${erro.message}`);
    }
  }

  // Buscar contrato por ID
  async buscarContratosPorId(id) {
    try {
      const contrato = await Contrato.buscarPorId(id);
      if (!contrato) {
        throw new Error('Contrato não encontrado');
      }
      return contrato;
    } catch (erro) {
      throw new Error(`Erro ao buscar contrato: ${erro.message}`);
    }
  }

  // Deletar contrato
  async deletarContrato(id) {
    try {
      await Contrato.deletar(id);
      return { mensagem: 'Contrato removido com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar contrato: ${erro.message}`);
    }
  }
}

module.exports = new ContratosService();
