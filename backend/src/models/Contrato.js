// Modelo de Contrato
// Funções para gerenciar contratos no banco de dados

const db = require('../config/database');

class Contrato {
  // Criar novo contrato
  static criar(editalId, dataInicio, dataFim) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO contratos (editalId, dataInicio, dataFim) VALUES (?, ?, ?)';
      db.run(sql, [editalId, dataInicio, dataFim], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, editalId, dataInicio, dataFim, status: 'ativo' });
      });
    });
  }

  // Listar todos os contratos
  static listar() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT contratos.*, editais.numero FROM contratos LEFT JOIN editais ON contratos.editalId = editais.id ORDER BY contratos.dataCriacao DESC';
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Buscar contrato por ID
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT contratos.*, editais.numero FROM contratos LEFT JOIN editais ON contratos.editalId = editais.id WHERE contratos.id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
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
