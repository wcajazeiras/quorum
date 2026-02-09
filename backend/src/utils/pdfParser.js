const pdfParse = require('pdf-parse');

const HEADING_MAX_LEN = 80;

function normalizeLines(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0);
}

function isHeading(line) {
  if (!line) return false;
  const upper = line.toUpperCase();
  const isUpper = upper === line;
  const shortEnough = line.length <= HEADING_MAX_LEN;
  const looksLikeAnexo = /^ANEXO\s+[IVXLC]+/i.test(line);
  const looksLikeSection = /^(OBJETO|JUSTIFICATIVA|PRAZO|VIGENCIA|DAS\s+CON|DA\s+CON|CRITERIOS|HABILITACAO|DOCUMENTACAO)/i.test(line);
  return (isUpper && shortEnough) || looksLikeAnexo || looksLikeSection;
}

function extractObjeto(lines) {
  const objetoIndex = lines.findIndex(line => /^OBJETO\b/i.test(line));
  if (objetoIndex === -1) return '';

  const collected = [];
  for (let i = objetoIndex + 1; i < lines.length; i += 1) {
    if (isHeading(lines[i])) break;
    collected.push(lines[i]);
    if (collected.join(' ').length > 600) break;
  }

  return collected.join(' ').trim();
}

function extractNumeroEdital(lines) {
  const regex = /EDITAL\s*(?:DE\s*)?N[ºO]?\s*[:\-]?\s*(\d{1,6}\/\d{4})/i;
  for (const line of lines) {
    const match = line.match(regex);
    if (match) return match[1];
  }
  return '';
}

function extractOrgao(lines) {
  const orgaoRegex = /(ORGAO\s+REALIZADOR\s+DO\s+CERTAME)\s*[:\-]?\s*(.+)/i;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(orgaoRegex);
    if (match && match[2]) {
      return match[2].trim();
    }
    if (/PREFEITURA|SECRETARIA|HOSPITAL|GOVERNO|FUNDO/i.test(line) && line.length <= 120) {
      return line.trim();
    }
  }
  return '';
}

function extractVigencia(lines) {
  const regex = /(VIGENCIA|VIGÊNCIA)\s*[:\-]?\s*(\d{4})/i;
  for (const line of lines) {
    const match = line.match(regex);
    if (match) return match[2];
  }
  return '';
}

function extractRequisitos(lines) {
  const keywords = /(dever[aá]|deve|obrigat[oó]rio|exig[eê]ncia|requisito|apresentar|comprovar)/i;
  const seen = new Set();
  const requisitos = [];

  lines.forEach(line => {
    if (line.length < 20 || line.length > 220) return;
    if (!keywords.test(line)) return;
    const normalized = line.replace(/^[-\d\.\)]+\s*/, '').trim();
    if (normalized.length < 20) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    requisitos.push(normalized);
  });

  return requisitos.slice(0, 30);
}

function splitAnexos(lines) {
  const indices = [];
  lines.forEach((line, idx) => {
    if (/^ANEXO\s+[IVXLC]+/i.test(line)) {
      indices.push({ idx, title: line });
    }
  });

  if (indices.length === 0) return [];

  const sections = [];
  for (let i = 0; i < indices.length; i += 1) {
    const start = indices[i].idx;
    const end = i + 1 < indices.length ? indices[i + 1].idx : lines.length;
    sections.push({
      title: indices[i].title,
      lines: lines.slice(start + 1, end)
    });
  }

  return sections;
}

function buildSchemaFromLines(lines) {
  const fields = [];
  const seen = new Set();

  lines.forEach(line => {
    if (line.length < 3) return;

    const underscoreMatch = line.match(/(.+?)\s*[_]{3,}/);
    const colonMatch = line.match(/^(.+?):\s*(.*)$/);

    let label = '';
    if (underscoreMatch) {
      label = underscoreMatch[1].trim();
    } else if (colonMatch) {
      label = colonMatch[1].trim();
    }

    if (!label || label.length < 3) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    fields.push({
      name: key.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, ''),
      label,
      type: 'text',
      required: false
    });
  });

  return { fields };
}

function extractResumo(lines, objeto) {
  if (objeto && objeto.length > 0) {
    return objeto;
  }

  const resumoLines = [];
  for (const line of lines) {
    if (isHeading(line)) continue;
    if (line.length < 25) continue;
    if (line.length > 220) continue;
    if (/https?:\/\//i.test(line)) continue;
    if (/E-?mail\b/i.test(line)) continue;
    resumoLines.push(line);
    if (resumoLines.join(' ').length > 360) break;
  }

  return resumoLines.join(' ').trim();
}

function buildResumo(objeto, requisitos, anexos, lines) {
  const resumoTexto = extractResumo(lines, objeto);
  const partes = [];
  if (resumoTexto) partes.push(resumoTexto);
  if (requisitos.length) partes.push(`${requisitos.length} requisitos mapeados.`);
  if (anexos.length) partes.push(`${anexos.length} anexos detectados.`);
  return partes.join(' ');
}

function parseEditalText(text, annexLinks = []) {
  const lines = normalizeLines(text || '');

  const objeto = extractObjeto(lines);
  const requisitos = extractRequisitos(lines);
  const numero = extractNumeroEdital(lines);
  const orgao = extractOrgao(lines);
  const vigencia = extractVigencia(lines);

  const annexSections = splitAnexos(lines);
  const anexos = annexSections.map(section => {
    const schema = buildSchemaFromLines(section.lines);
    return {
      titulo: section.title,
      fonte: 'edital',
      link: '',
      schema
    };
  });

  annexLinks.forEach(link => {
    anexos.push({
      titulo: link.titulo || 'Anexo externo',
      fonte: 'link',
      link: link.url,
      schema: { fields: [] }
    });
  });

  const resumo = buildResumo(objeto, requisitos, anexos, lines);

  const tarefas = requisitos.map(texto => ({
    titulo: `Validar requisito: ${texto.substring(0, 60)}${texto.length > 60 ? '...' : ''}`,
    descricao: texto,
    status: 'pendente'
  }));

  return {
    numero,
    orgao,
    vigencia,
    objeto,
    resumo,
    requisitos,
    anexos,
    tarefas
  };
}

async function parseEditalPdf(buffer, annexLinks = []) {
  const data = await pdfParse(buffer);
  return parseEditalText(data.text || '', annexLinks);
}

module.exports = {
  parseEditalPdf,
  parseEditalText
};
