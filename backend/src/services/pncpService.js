// Serviço de integração com o Portal Nacional de Contratações Públicas (PNCP)
// API pública: https://pncp.gov.br/api/consulta

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1';
const BASE_URL_PNCP = 'https://pncp.gov.br/api/pncp/v1';
const MAX_PAGE_SIZE = 50; // Máximo permitido pela API PNCP
const MAX_CONCURRENCY = 6; // Requisições paralelas simultâneas

// Modalidades de contratação — códigos do endpoint Consulta PNCP (/v1/contratacoes/publicacao)
const MODALIDADES = {
  1: 'Leilão - Eletrônico',
  2: 'Diálogo Competitivo',
  3: 'Concurso',
  4: 'Concorrência - Eletrônica',
  5: 'Concorrência - Presencial',
  6: 'Pregão - Eletrônico',
  7: 'Pregão - Presencial',
  8: 'Dispensa',
  9: 'Inexigibilidade',
  10: 'Manifestação de Interesse',
  11: 'Pré-qualificação',
  12: 'Credenciamento',
  13: 'Leilão - Presencial',
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
      const modalidadesPrincipais = [1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13];
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
   * Helper: fetch pages with concurrency limit
   */
  static async _fetchPagesWithConcurrency(fetchFn, totalPaginas, concurrency = MAX_CONCURRENCY) {
    const results = [];
    for (let i = 0; i < totalPaginas; i += concurrency) {
      const batch = [];
      for (let j = i; j < Math.min(i + concurrency, totalPaginas); j++) {
        batch.push(fetchFn(j + 1).catch(() => ({ data: [] })));
      }
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }
    return results;
  }

  /**
   * Buscar TODAS as contratações (todas as páginas) para uma modalidade
   */
  static async _buscarTodasPaginas({ dataInicial, dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj }) {
    // Primeira página para obter metadados
    const first = await PncpService.buscarContratacoes({
      dataInicial, dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj,
      pagina: 1, tamanhoPagina: MAX_PAGE_SIZE
    });

    const allData = [...(first.data || [])];
    const totalPaginas = first.totalPaginas || 1;
    const totalRegistros = first.totalRegistros || 0;

    if (totalPaginas <= 1) {
      return { data: allData, totalRegistros, totalPaginas: 1 };
    }

    // Fetch remaining pages with concurrency
    const fetchPage = (pag) => PncpService.buscarContratacoes({
      dataInicial, dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj,
      pagina: pag, tamanhoPagina: MAX_PAGE_SIZE
    });

    // Skip page 1 (already fetched), fetch pages 2..totalPaginas
    const remainingPages = totalPaginas - 1;
    const results = [];
    for (let i = 0; i < remainingPages; i += MAX_CONCURRENCY) {
      const batch = [];
      for (let j = i; j < Math.min(i + MAX_CONCURRENCY, remainingPages); j++) {
        batch.push(fetchPage(j + 2).catch(() => ({ data: [] })));
      }
      const batchResults = await Promise.all(batch);
      for (const r of batchResults) {
        allData.push(...(r.data || []));
      }
    }

    return { data: allData, totalRegistros, totalPaginas };
  }

  /**
   * Buscar TODAS as contratações de todas as páginas e modalidades
   * Retorna dataset completo para filtro/ordenação client-side
   */
  static async buscarTodasContratacoes({ dataInicial, dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj }) {
    if (codigoModalidadeContratacao) {
      return PncpService._buscarTodasPaginas({
        dataInicial, dataFinal, codigoModalidadeContratacao, uf, codigoMunicipioIbge, cnpj
      });
    }

    // Sem modalidade: buscar todas as modalidades em paralelo
    const modalidadesPrincipais = [1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13];
    const promises = modalidadesPrincipais.map(mod =>
      PncpService._buscarTodasPaginas({
        dataInicial, dataFinal,
        codigoModalidadeContratacao: mod,
        uf, codigoMunicipioIbge, cnpj
      }).catch(() => ({ data: [], totalRegistros: 0, totalPaginas: 0 }))
    );
    const resultados = await Promise.all(promises);
    const allData = resultados.flatMap(r => r.data || []);
    const totalRegistros = allData.length;

    // Deduplicar por numeroControlePNCP
    const seen = new Set();
    const deduplicated = [];
    for (const item of allData) {
      const key = item.numeroControlePNCP || JSON.stringify(item);
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    return { data: deduplicated, totalRegistros: deduplicated.length, totalPaginas: 1 };
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
   * Buscar itens de uma contratação
   * Endpoint: GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens
   */
  static async buscarItens(cnpj, ano, sequencial) {
    const url = `${BASE_URL_PNCP}/orgaos/${cnpj}/compras/${ano}/${sequencial}/itens`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (response.status === 204) return [];
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PNCP API erro ${response.status}: ${text}`);
    }
    return response.json();
  }

  /**
   * Buscar arquivos de uma contratação
   * Endpoint: GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos
   */
  static async buscarArquivos(cnpj, ano, sequencial) {
    const url = `${BASE_URL_PNCP}/orgaos/${cnpj}/compras/${ano}/${sequencial}/arquivos`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (response.status === 204) return [];
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PNCP API erro ${response.status}: ${text}`);
    }
    return response.json();
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
