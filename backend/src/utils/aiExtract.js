const fs = require('fs');
const os = require('os');
const path = require('path');
const OpenAI = require('openai');

const DEFAULT_MODEL = 'gpt-4o-mini';
const MAX_TEXT_CHARS = 12000;

function truncateText(text) {
  if (!text) return '';
  if (text.length <= MAX_TEXT_CHARS) return text;
  return text.slice(0, MAX_TEXT_CHARS);
}

function buildPrompt(text, annexLinks) {
  const linksText = Array.isArray(annexLinks) && annexLinks.length > 0
    ? JSON.stringify(annexLinks)
    : '[]';

  return [
    'Voce eh um agente especialista em editais brasileiros.',
    'Tarefa: extrair dados estruturados do edital e mapear anexos com campos de formulario.',
    'Retorne APENAS JSON valido no schema abaixo. Use strings vazias quando desconhecido.',
    'Schema:',
    '{',
    '  "numero": "",',
    '  "orgao": "",',
    '  "tipoOrgao": "Municipio|Estado|Federal|",',
    '  "estado": "",',
    '  "municipio": "",',
    '  "vigencia": "",',
    '  "objeto": "",',
    '  "resumo": "",',
    '  "requisitos": [{ "texto": "", "criticidade": "Media|Alta|Baixa", "status": "Em analise" }],',
    '  "anexos": [{ "titulo": "", "fonte": "edital", "link": "", "schema": { "fields": [{ "name": "", "label": "", "type": "text", "required": false }] } }],',
    '  "tarefas": [{ "titulo": "", "descricao": "", "status": "pendente" }]',
    '}',
    'Regras:',
    '- "orgao": se houver "Orgao Realizador do Certame", use exatamente o valor informado.',
    '- "objeto": priorize ANEXO I – TERMO DE REFERENCIA ou secao OBJETO.',
    '- "resumo": 2-3 frases claras, sem repetir textos longos ou fragmentados.',
    '- "requisitos": liste exigencias objetivas; evite frases soltas sem verbo.',
    '- "anexos": normalize titulos como "Anexo II - ..."; nao duplique anexos similares.',
    '- "schema.fields": use labels reais do modelo; se nao houver, deixe vazio.',
    `Links de anexos (complementares): ${linksText}`,
    'Texto extraido:',
    truncateText(text)
  ].join('\n');
}

function parseJsonFromText(rawText) {
  if (!rawText) return null;
  const start = rawText.indexOf('{');
  const end = rawText.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const jsonText = rawText.slice(start, end + 1);
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    return null;
  }
}

function getOutputText(response) {
  if (!response) return '';
  if (response.output_text) return response.output_text;
  if (Array.isArray(response.output)) {
    const content = response.output
      .flatMap(item => item.content || [])
      .map(item => item.text || '')
      .join('\n');
    return content;
  }
  return '';
}

async function uploadPdfToVectorStore(client, buffer) {
  const tmpFile = path.join(os.tmpdir(), `edital-${Date.now()}.pdf`);
  await fs.promises.writeFile(tmpFile, buffer);

  try {
    const file = await client.files.create({
      file: fs.createReadStream(tmpFile),
      purpose: 'assistants'
    });

    const vectorStore = await client.vectorStores.create({
      name: `edital-${Date.now()}`
    });

    await client.vectorStores.files.create(vectorStore.id, {
      file_id: file.id
    });

    return { fileId: file.id, vectorStoreId: vectorStore.id };
  } finally {
    fs.promises.unlink(tmpFile).catch(() => {});
  }
}

async function extractEditalWithAI(text, pdfBuffer, annexLinks) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const { fileId, vectorStoreId } = await uploadPdfToVectorStore(client, pdfBuffer);
  const prompt = buildPrompt(text, annexLinks);

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      temperature: 0.2,
      tools: [{ type: 'file_search' }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      },
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_file', file_id: fileId }
          ]
        }
      ]
    });

    const outputText = getOutputText(response);
    return parseJsonFromText(outputText);
  } catch (error) {
    return null;
  }
}

module.exports = {
  extractEditalWithAI
};
