// Serviço de Plantões
// Contém a lógica de negócio para plantões

const Plantao = require('../models/Plantao');

class PlantõesService {
  // Criar plantão com validações
  async criarPlantao(medicoId, data, cargaHoraria, contratoId) {
    // Validar campos obrigatórios
    if (!medicoId || !data || !cargaHoraria) {
      throw new Error('Médico, data e carga horária são obrigatórios');
    }

    // Validar carga horária
    if (cargaHoraria <= 0 || cargaHoraria > 24) {
      throw new Error('Carga horária deve estar entre 0 e 24 horas');
    }

    try {
      const plantao = await Plantao.criar(medicoId, data, cargaHoraria, contratoId);
      return plantao;
    } catch (erro) {
      throw new Error(`Erro ao criar plantão: ${erro.message}`);
    }
  }

  // Listar todos os plantões
  async listarPlantoes() {
    try {
      const plantoes = await Plantao.listar();
      return plantoes;
    } catch (erro) {
      throw new Error(`Erro ao listar plantões: ${erro.message}`);
    }
  }

  // Buscar plantões de um médico
  async buscarPlantoesPorMedico(medicoId) {
    try {
      const plantoes = await Plantao.buscarPorMedico(medicoId);
      return plantoes;
    } catch (erro) {
      throw new Error(`Erro ao buscar plantões: ${erro.message}`);
    }
  }

  // Atualizar plantão
  async atualizarPlantao(id, medicoId, data, cargaHoraria, contratoId) {
    if (!id) {
      throw new Error('ID do plantao e obrigatorio');
    }

    if (!medicoId || !data || !cargaHoraria) {
      throw new Error('Médico, data e carga horária são obrigatórios');
    }

    if (cargaHoraria <= 0 || cargaHoraria > 24) {
      throw new Error('Carga horária deve estar entre 0 e 24 horas');
    }

    try {
      const plantao = await Plantao.atualizar(id, medicoId, data, cargaHoraria, contratoId);
      return plantao;
    } catch (erro) {
      throw new Error(`Erro ao atualizar plantao: ${erro.message}`);
    }
  }

  // Deletar plantão
  async deletarPlantao(id) {
    try {
      await Plantao.deletar(id);
      return { mensagem: 'Plantão removido com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar plantão: ${erro.message}`);
    }
  }
}

module.exports = new PlantõesService();
