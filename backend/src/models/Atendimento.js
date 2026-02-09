// Modelo de Atendimento
// Funções para gerenciar atendimentos no banco de dados

const db = require('../config/database');

class Atendimento {
  // Criar novo atendimento
  static criar(medicoId, data, descricao) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO atendimentos (medicoId, data, descricao) VALUES (?, ?, ?)';
      db.run(sql, [medicoId, data, descricao], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, medicoId, data, descricao });
      });
    });
  }

  // Listar todos os atendimentos
  static listar() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT atendimentos.*, medicos.nome FROM atendimentos LEFT JOIN medicos ON atendimentos.medicoId = medicos.id ORDER BY atendimentos.data DESC';
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Buscar atendimentos de um médico
  static buscarPorMedico(medicoId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT atendimentos.*, medicos.nome FROM atendimentos LEFT JOIN medicos ON atendimentos.medicoId = medicos.id WHERE atendimentos.medicoId = ? ORDER BY atendimentos.data DESC';
      db.all(sql, [medicoId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Deletar atendimento
  static deletar(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM atendimentos WHERE id = ?';
      db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve({ mensagem: 'Atendimento deletado' });
      });
    });
  }
}

module.exports = Atendimento;
