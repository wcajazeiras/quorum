// Serviço de Atendimentos
// Contém a lógica de negócio para atendimentos

const Atendimento = require('../models/Atendimento');

class AtendimentosService {
  // Criar atendimento com validações
  async criarAtendimento(medicoId, data, descricao) {
    // Validar campos obrigatórios
    if (!medicoId || !data || !descricao) {
      throw new Error('Médico, data e descrição são obrigatórios');
    }

    try {
      const atendimento = await Atendimento.criar(medicoId, data, descricao);
      return atendimento;
    } catch (erro) {
      throw new Error(`Erro ao criar atendimento: ${erro.message}`);
    }
  }

  // Listar todos os atendimentos
  async listarAtendimentos() {
    try {
      const atendimentos = await Atendimento.listar();
      return atendimentos;
    } catch (erro) {
      throw new Error(`Erro ao listar atendimentos: ${erro.message}`);
    }
  }

  // Buscar atendimentos de um médico
  async buscarAtendimentosPorMedico(medicoId) {
    try {
      const atendimentos = await Atendimento.buscarPorMedico(medicoId);
      return atendimentos;
    } catch (erro) {
      throw new Error(`Erro ao buscar atendimentos: ${erro.message}`);
    }
  }

  // Deletar atendimento
  async deletarAtendimento(id) {
    try {
      await Atendimento.deletar(id);
      return { mensagem: 'Atendimento removido com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar atendimento: ${erro.message}`);
    }
  }
}

module.exports = new AtendimentosService();
