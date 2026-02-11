// Serviço de Editais
// Contém a lógica de negócio para editais

const Edital = require('../models/Edital');

class EditaisService {
  // Criar edital com validações
  async criarEdital(numero, orgao, tipoOrgao, estado, municipio, vigencia) {
    // Validar campos obrigatórios
    if (!numero || !orgao || !tipoOrgao || !vigencia) {
      throw new Error('Número, órgão, tipo de órgão e vigência são obrigatórios');
    }

    // Validar se tipo é Estado ou Município
    if ((tipoOrgao === 'Estado' || tipoOrgao === 'Município') && !estado) {
      throw new Error('Estado é obrigatório para Estado ou Município');
    }

    if (tipoOrgao === 'Município' && !municipio) {
      throw new Error('Município é obrigatório');
    }

    try {
      const edital = await Edital.criar(numero, orgao, tipoOrgao, estado, municipio, vigencia);
      return edital;
    } catch (erro) {
      throw new Error(`Erro ao criar edital: ${erro.message}`);
    }
  }

  // Listar todos os editais
  async listarEditais() {
    try {
      const editais = await Edital.listar();
      return editais;
    } catch (erro) {
      throw new Error(`Erro ao listar editais: ${erro.message}`);
    }
  }

  // Buscar edital por ID
  async buscarEditaisPorId(id) {
    try {
      const edital = await Edital.buscarPorId(id);
      if (!edital) {
        throw new Error('Edital não encontrado');
      }
      return edital;
    } catch (erro) {
      throw new Error(`Erro ao buscar edital: ${erro.message}`);
    }
  }

  // Deletar edital
  async deletarEdital(id) {
    try {
      await Edital.deletar(id);
      return { mensagem: 'Edital removido com sucesso' };
    } catch (erro) {
      throw new Error(`Erro ao deletar edital: ${erro.message}`);
    }
  }
}

module.exports = new EditaisService();
