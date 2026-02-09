// Serviço de Médicos
// Contém a lógica de negócio para médicos

const Medico = require('../models/Medico');

class MedicosService {
  // Criar médico com validações
  async criarMedico(dados) {
    // Validar campos obrigatórios
    if (!dados || !dados.nome || !dados.especialidade) {
      throw new Error('Nome e especialidade são obrigatórios');
    }

    try {
      const medico = await Medico.criar(
        dados.nome,
        dados.especialidade,
        dados.crm || null,
        dados.telefone || null,
        dados.email || null,
        dados.uf || null,
        dados.municipio || null,
        dados.status || 'ativo'
      );
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

  // Atualizar médico
  async atualizarMedico(id, dados) {
    if (!id) {
      throw new Error('ID do medico e obrigatorio');
    }

    if (!dados || !dados.nome || !dados.especialidade) {
      throw new Error('Nome e especialidade sao obrigatorios');
    }

    try {
      const medicoAtualizado = await Medico.atualizar(
        id,
        dados.nome,
        dados.especialidade,
        dados.crm || null,
        dados.telefone || null,
        dados.email || null,
        dados.uf || null,
        dados.municipio || null,
        dados.status || 'ativo'
      );
      return medicoAtualizado;
    } catch (erro) {
      throw new Error(`Erro ao atualizar medico: ${erro.message}`);
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
