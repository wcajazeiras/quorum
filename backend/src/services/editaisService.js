// Serviço de Editais
// Contém a lógica de negócio para editais

const Edital = require('../models/Edital');
const Requisito = require('../models/Requisito');
const Anexo = require('../models/Anexo');
const Tarefa = require('../models/Tarefa');
const pdfParse = require('pdf-parse');
const { parseEditalText } = require('../utils/pdfParser');
const { extractEditalWithAI } = require('../utils/aiExtract');

function sanitizeAiResult(result) {
  if (!result || typeof result !== 'object') return null;

  const anexos = Array.isArray(result.anexos) ? result.anexos : [];
  const seen = new Set();
  const anexosRegex = /^Anexo\s+[IVXLC]+\s*[\-–]\s+.+/i;
  const dedupedAnexos = anexos.filter(anexo => {
    if (!anexo || !anexo.titulo) return false;
    const cleanTitle = anexo.titulo.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!anexosRegex.test(anexo.titulo)) return false;
    const key = cleanTitle.replace(/[;:.]+$/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const requisitos = Array.isArray(result.requisitos) ? result.requisitos : [];
  const filteredRequisitos = requisitos.filter(req => req && req.texto && req.texto.length > 20);

  return {
    ...result,
    anexos: dedupedAnexos,
    requisitos: filteredRequisitos
  };
}

class EditaisService {
  // Criar edital com validações
  async criarEdital(payload) {
    const {
      numero,
      orgao,
      tipoOrgao,
      estado,
      municipio,
      vigencia,
      objeto,
      resumo,
      pdfNome,
      status,
      pncpNumeroControle,
      linkSistemaOrigem,
      requisitos,
      anexos,
      tarefas
    } = payload;

    // Validar campos obrigatórios
    if (!numero || !orgao || !tipoOrgao || !vigencia) {
      throw new Error('Número, órgão, tipo de órgão e vigência são obrigatórios');
    }

    // Validar se tipo é Estado ou Município
    if ((tipoOrgao === 'Estado' || tipoOrgao === 'Município' || tipoOrgao === 'Municipio') && !estado) {
      throw new Error('Estado é obrigatório para Estado ou Município');
    }

    if ((tipoOrgao === 'Município' || tipoOrgao === 'Municipio') && !municipio) {
      throw new Error('Município é obrigatório');
    }

    try {
      const edital = await Edital.criar(numero, orgao, tipoOrgao, estado, municipio, vigencia, objeto, resumo, pdfNome, status, pncpNumeroControle, linkSistemaOrigem);

      if (Array.isArray(requisitos)) {
        for (const requisito of requisitos) {
          if (!requisito || !requisito.texto) continue;
          await Requisito.criar(edital.id, requisito.texto, requisito.criticidade, requisito.status);
        }
      }

      if (Array.isArray(anexos)) {
        for (const anexo of anexos) {
          if (!anexo || !anexo.titulo) continue;
          const schemaJson = anexo.schema ? JSON.stringify(anexo.schema) : '';
          await Anexo.criar(edital.id, anexo.titulo, anexo.fonte, anexo.link, schemaJson);
        }
      }

      if (Array.isArray(tarefas)) {
        for (const tarefa of tarefas) {
          if (!tarefa || !tarefa.titulo) continue;
          await Tarefa.criar(edital.id, tarefa.titulo, tarefa.descricao, tarefa.status);
        }
      }

      return edital;
    } catch (erro) {
      throw new Error(`Erro ao criar edital: ${erro.message}`);
    }
  }

  async analisarEditalPdf(fileBuffer, fileName, annexLinks) {
    try {
      const data = await pdfParse(fileBuffer);
      const text = data.text || '';
      const aiResult = await extractEditalWithAI(text, fileBuffer, annexLinks);
      const cleanedAi = sanitizeAiResult(aiResult);
      const parsed = cleanedAi || parseEditalText(text, annexLinks);
      return {
        ...parsed,
        pdfNome: fileName
      };
    } catch (erro) {
      throw new Error(`Erro ao analisar edital: ${erro.message}`);
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

  // Atualizar edital
  async atualizarEdital(id, dados) {
    if (!id) throw new Error('ID do edital é obrigatório');
    if (!dados || !dados.numero || !dados.orgao) throw new Error('Número e órgão são obrigatórios');
    try {
      const edital = await Edital.atualizar(
        id,
        dados.numero,
        dados.orgao,
        dados.tipoOrgao || 'Município',
        dados.estado || null,
        dados.municipio || null,
        dados.vigencia || '',
        dados.objeto || null,
        dados.resumo || null,
        dados.pdfNome || null,
        dados.status || 'aberto'
      );
      return edital;
    } catch (erro) {
      throw new Error(`Erro ao atualizar edital: ${erro.message}`);
    }
  }
}

module.exports = new EditaisService();
