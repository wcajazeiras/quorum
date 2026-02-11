// Serviço de Médicos
// Contém a lógica de negócio para médicos

const Medico = require('../models/Medico');

class MedicosService {
  // Criar médico com validações
  async criarMedico(nome, especialidade) {
    // Validar campos obrigatórios
    if (!nome || !especialidade) {
      throw new Error('Nome e especialidade são obrigatórios');
    }

    try {
      const medico = await Medico.criar(nome, especialidade);
      return medico;
    } catch (erro) {
      throw new Error(`Erro ao criar médico: ${erro.message}`);
    }
  }

  // Listar todos os médicos
  async listarMedicos() {
    try {
      const medicos = await Medico.listar();
      return medicos;
    } catch (erro) {
      throw new Error(`Erro ao listar médicos: ${erro.message}`);
    }
  }

  // Buscar médico por ID
  async buscarMedicoPorId(id) {
    try {
      const medico = await Medico.buscarPorId(id);
      if (!medico) {
        throw new Error('Médico não encontrado');
      }
      return medico;
    } catch (erro) {
      throw new Error(`Erro ao buscar médico: ${erro.message}`);
    }
  }

  // Deletar médico
  async deletarMedico(id) {
    try {
      await Medico.deletar(id);
      return { mensagem: 'Médico removido com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar médico: ${erro.message}`);
    }
  }
}

module.exports = new MedicosService();
