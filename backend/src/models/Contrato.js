// Modelo de Contrato
// Funções para gerenciar contratos no banco de dados

const db = require('../config/database');

class Contrato {
  // Criar novo contrato
  static criar({ editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, observacoes }) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO contratos (editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, observacoes)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, observacoes], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, observacoes, status: 'ativo' });
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
                          editais.estado AS editalEstado
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
                          editais.estado AS editalEstado
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
  static atualizar(id, { editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, status, observacoes }) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE contratos SET editalId = ?, numero = ?, objeto = ?, valor = ?, responsavel = ?,
                   dataInicio = ?, dataFim = ?, status = ?, observacoes = ? WHERE id = ?`;
      db.run(sql, [editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, status, observacoes, id], function(err) {
        if (err) reject(err);
        else resolve({ id, editalId, numero, objeto, valor, responsavel, dataInicio, dataFim, status, observacoes });
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
}

module.exports = Contrato;
