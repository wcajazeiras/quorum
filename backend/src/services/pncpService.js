// Serviço de integração com o Portal Nacional de Contratações Públicas (PNCP)
// API pública: https://pncp.gov.br/api/consulta

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1';

// Modalidades de contratação (Lei 14.133/2021 + Lei 8.666/1993)
const MODALIDADES = {
  1: 'Leilão - Loss nº 14.133/2021',
  2: 'Diálogo Competitivo - Lei nº 14.133/2021',
  3: 'Concurso - Lei nº 14.133/2021',
  4: 'Concorrência - Lei nº 14.133/2021',
  5: 'Pregão - Lei nº 14.133/2021',
  6: 'Dispensa de Licitação - Lei nº 14.133/2021',
  7: 'Inexigibilidade - Lei nº 14.133/2021',
  8: 'Pré-qualificação - Lei nº 14.133/2021',
  9: 'Credenciamento - Lei nº 14.133/2021',
  10: 'Leilão - Lei nº 8.666/1993',
  11: 'Concurso - Lei nº 8.666/1993',
  12: 'Concorrência - Lei nº 8.666/1993',
  13: 'Convite - Lei nº 8.666/1993',
  14: 'Pregão - Lei nº 10.520/2002',
};

class PncpService {
  /**
   * Buscar contratações por data de publicação
   * Endpoint: GET /v1/contratacoes/publicacao
   */
  static async buscarContratacoes({ dataInicial, dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj, pagina = 1, tamanhoPagina = 15 }) {
    // A API do PNCP exige codigoModalidadeContratacao.
    // Quando não informado, busca nas modalidades mais comuns em paralelo e mescla.
    if (!codigoModalidadeContratacao) {
      const modalidadesPrincipais = [4, 5, 6, 7, 9]; // Concorrência, Pregão, Dispensa, Inexigibilidade, Credenciamento
      const promises = modalidadesPrincipais.map(mod =>
        PncpService.buscarContratacoes({
          dataInicial, dataFinal,
          codigoModalidadeContratacao: mod,
          uf, codigoMunicipioIbge, cnpj,
          pagina, tamanhoPagina
        }).catch(() => ({ data: [], totalRegistros: 0, totalPaginas: 0 }))
      );
      const resultados = await Promise.all(promises);
      const allData = resultados.flatMap(r => r.data || []);
      const totalRegistros = resultados.reduce((s, r) => s + (r.totalRegistros || 0), 0);
      const totalPaginas = Math.max(...resultados.map(r => r.totalPaginas || 0), 0);
      return { data: allData, totalRegistros, totalPaginas, numeroPagina: pagina };
    }

    const params = new URLSearchParams();
    params.set('dataInicial', dataInicial);
    params.set('dataFinal', dataFinal);
    params.set('codigoModalidadeContratacao', codigoModalidadeContratacao);
    params.set('pagina', pagina);
    params.set('tamanhoPagina', tamanhoPagina);
    if (uf) params.set('uf', uf);
    if (codigoMunicipioIbge) params.set('codigoMunicipioIbge', codigoMunicipioIbge);
    if (cnpj) params.set('cnpj', cnpj);

    const url = `${BASE_URL}/contratacoes/publicacao?${params.toString()}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.status === 204) return { data: [], totalRegistros: 0, totalPaginas: 0, numeroPagina: pagina, empty: true };
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PNCP API erro ${response.status}: ${text}`);
    }
    return response.json();
  }

  /**
   * Buscar contratações com recebimento de propostas aberto
   * Endpoint: GET /v1/contratacoes/proposta
   */
  static async buscarPropostasAbertas({ dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj, pagina = 1, tamanhoPagina = 15 }) {
    const params = new URLSearchParams();
    params.set('dataFinal', dataFinal);
    params.set('pagina', pagina);
    params.set('tamanhoPagina', tamanhoPagina);
    if (codigoModalidadeContratacao) params.set('codigoModalidadeContratacao', codigoModalidadeContratacao);
    if (uf) params.set('uf', uf);
    if (codigoMunicipioIbge) params.set('codigoMunicipioIbge', codigoMunicipioIbge);
    if (cnpj) params.set('cnpj', cnpj);

    const url = `${BASE_URL}/contratacoes/proposta?${params.toString()}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.status === 204) return { data: [], totalRegistros: 0, totalPaginas: 0, numeroPagina: pagina, empty: true };
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PNCP API erro ${response.status}: ${text}`);
    }
    return response.json();
  }

  /**
   * Consultar detalhes de uma contratação específica
   * Endpoint: GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}
   */
  static async buscarContratacao(cnpj, ano, sequencial) {
    const url = `${BASE_URL}/orgaos/${cnpj}/compras/${ano}/${sequencial}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (response.status === 204) return null;
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PNCP API erro ${response.status}: ${text}`);
    }
    return response.json();
  }

  /**
   * Retorna a lista de modalidades de contratação
   */
  static getModalidades() {
    return MODALIDADES;
  }

  /**
   * Normaliza dados da contratação PNCP para o formato de edital do Quorum
   */
  static normalizarParaEdital(contratacao) {
    const orgaoNome = contratacao.orgaoEntidade?.razaoSocial || '';
    const unidade = contratacao.unidadeOrgao || {};
    const ufSigla = unidade.ufSigla || '';
    const municipio = unidade.municipioNome || '';

    // Determinar tipo de órgão pela esfera
    let tipoOrgao = 'Municipal';
    const esfera = contratacao.orgaoEntidade?.esferaId;
    if (esfera === 'F') tipoOrgao = 'Federal';
    else if (esfera === 'E') tipoOrgao = 'Estadual';
    else if (esfera === 'M') tipoOrgao = 'Municipal';

    // Status baseado na situação da compra
    let status = 'aberto';
    const situacaoId = contratacao.situacaoCompraId;
    if (situacaoId === '1') status = 'aberto';       // Divulgada
    else if (situacaoId === '2') status = 'em_analise'; // Ativa
    else if (situacaoId === '3') status = 'adjudicado'; // Suspensa
    else if (situacaoId === '4') status = 'encerrado';  // Revogada/Anulada

    // Vigência a partir das datas de proposta
    let vigencia = '';
    if (contratacao.dataAberturaProposta) {
      const abertura = new Date(contratacao.dataAberturaProposta).toLocaleDateString('pt-BR');
      vigencia = `Abertura: ${abertura}`;
    }
    if (contratacao.dataEncerramentoProposta) {
      const enc = new Date(contratacao.dataEncerramentoProposta).toLocaleDateString('pt-BR');
      vigencia += vigencia ? ` | Encerramento: ${enc}` : `Encerramento: ${enc}`;
    }

    return {
      numero: contratacao.numeroCompra || contratacao.numeroControlePNCP || '',
      orgao: orgaoNome,
      tipoOrgao,
      estado: ufSigla,
      municipio,
      vigencia: vigencia || '-',
      objeto: contratacao.objetoCompra || '',
      resumo: [
        contratacao.modalidadeNome ? `Modalidade: ${contratacao.modalidadeNome}` : '',
        contratacao.valorTotalEstimado ? `Valor estimado: R$ ${Number(contratacao.valorTotalEstimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '',
        contratacao.situacaoCompraNome ? `Situação: ${contratacao.situacaoCompraNome}` : '',
        contratacao.informacaoComplementar || ''
      ].filter(Boolean).join('\n'),
      status,
      pncpNumeroControle: contratacao.numeroControlePNCP || '',
      pncpData: contratacao,
    };
  }
}

module.exports = PncpService;
