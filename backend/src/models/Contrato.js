// Modelo de Contrato
// Funções para gerenciar contratos no banco de dados

const db = require('../config/database');

class Contrato {
  // Criar novo contrato
  static criar({ editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, observacoes, pncpNumeroControle }) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO contratos (editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, observacoes, pncpNumeroControle)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, observacoes, pncpNumeroControle || null], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, observacoes, pncpNumeroControle, status: 'ativo' });
      });
    });
  }

  // Listar todos os contratos
  static listar() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT contratos.*,
                          editais.numero AS editalNumero,
                          editais.orgao,
                          editais.municipio AS editalMunicipio,
                          editais.estado AS editalEstado,
                          editais.pncpNumeroControle AS editalPncpNumeroControle
                   FROM contratos
                   LEFT JOIN editais ON contratos.editalId = editais.id
                   ORDER BY contratos.dataCriacao DESC`;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Buscar contrato por ID
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT contratos.*,
                          editais.numero AS editalNumero,
                          editais.orgao,
                          editais.municipio AS editalMunicipio,
                          editais.estado AS editalEstado,
                          editais.pncpNumeroControle AS editalPncpNumeroControle,
                          editais.objeto AS editalObjeto,
                          editais.vigencia AS editalVigencia,
                          editais.status AS editalStatus,
                          editais.resumo AS editalResumo
                   FROM contratos
                   LEFT JOIN editais ON contratos.editalId = editais.id
                   WHERE contratos.id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Atualizar contrato
  static atualizar(id, { editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, status, observacoes, pncpNumeroControle }) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE contratos SET editalId = ?, numero = ?, objeto = ?, valor = ?, responsavel = ?,
                   dataInicio = ?, dataFim = ?, status = ?, observacoes = ?, pncpNumeroControle = ? WHERE id = ?`;
      db.run(sql, [editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, status, observacoes, pncpNumeroControle || null, id], function(err) {
        if (err) reject(err);
        else resolve({ id, editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, status, observacoes, pncpNumeroControle });
      });
    });
  }

  // Deletar contrato
  static deletar(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM contratos WHERE id = ?';
      db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve({ mensagem: 'Contrato deletado' });
      });
    });
  }

  // Contar contratos por edital
  static contarPorEdital(editalId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT COUNT(*) AS total FROM contratos WHERE editalId = ?';
      db.get(sql, [editalId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total : 0);
      });
    });
  }

  // Buscar maior sequencial de contrato no ano
  static buscarMaiorSequencialAno(ano) {
    return new Promise((resolve, reject) => {
      const pattern = `%/${ano}`;
      const sql = `SELECT numero FROM contratos WHERE numero LIKE ? ORDER BY numero DESC`;
      db.all(sql, [pattern], (err, rows) => {
        if (err) reject(err);
        else {
          let maxSeq = 0;
          (rows || []).forEach(r => {
            const m = (r.numero || '').match(/^CT-(\d+)\//); 
            if (m) {
              const seq = parseInt(m[1], 10);
              if (seq > maxSeq) maxSeq = seq;
            }
          });
          resolve(maxSeq);
        }
      });
    });
  }
}

module.exports = Contrato;
