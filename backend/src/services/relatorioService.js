// Serviço de Relatórios
// Gera relatórios sobre execução de contratos

const Medico = require('../models/Medico');
const Plantao = require('../models/Plantao');
const Atendimento = require('../models/Atendimento');

class RelatorioService {
  // Gerar relatório de execução de um médico
  async gerarRelatorioPorMedico(medicoId) {
    try {
      // Buscar médico
      const medico = await Medico.buscarPorId(medicoId);
      if (!medico) {
        throw new Error('Médico não encontrado');
      }

      // Buscar plantões do médico
      const plantoes = await Plantao.buscarPorMedico(medicoId);
      const totalHorasPlantao = plantoes.reduce((total, p) => total + p.cargaHoraria, 0);

      // Buscar atendimentos do médico
      const atendimentos = await Atendimento.buscarPorMedico(medicoId);

      // Montrar relatório
      return {
        medico: medico.nome,
        especialidade: medico.especialidade,
        totalPlantoes: plantoes.length,
        totalHorasPlantao: totalHorasPlantao.toFixed(2),
        totalAtendimentos: atendimentos.length,
        plantores: plantoes,
        atendimentos: atendimentos,
        status: plantoes.length > 0 && atendimentos.length > 0 ? 'Ativo' : 'Inativo'
      };
    } catch (erro) {
      throw new Error(`Erro ao gerar relatório: ${erro.message}`);
    }
  }

  // Gerar relatório geral de todos os médicos
  async gerarRelatorioGeral() {
    try {
      // Buscar todos os médicos
      const medicos = await Medico.listar();
      
      // Para cada médico, buscar dados
      const relatorios = await Promise.all(
        medicos.map(async (medico) => {
          const plantoes = await Plantao.buscarPorMedico(medico.id);
          const atendimentos = await Atendimento.buscarPorMedico(medico.id);
          const totalHoras = plantoes.reduce((total, p) => total + p.cargaHoraria, 0);

          return {
            id: medico.id,
            nome: medico.nome,
            especialidade: medico.especialidade,
            plantoes: plantoes.length,
            horas: totalHoras.toFixed(2),
            atendimentos: atendimentos.length,
            status: plantoes.length > 0 && atendimentos.length > 0 ? 'Ativo' : 'Inativo'
          };
        })
      );

      return relatorios;
    } catch (erro) {
      throw new Error(`Erro ao gerar relatório geral: ${erro.message}`);
    }
  }
}

module.exports = new RelatorioService();
