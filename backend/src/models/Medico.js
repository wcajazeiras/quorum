// Modelo de Médico
// Funções para gerenciar médicos no banco de dados

const db = require('../config/database');

class Medico {
  // Criar novo médico
  static criar(nome, especialidade) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO medicos (nome, especialidade) VALUES (?, ?)';
      db.run(sql, [nome, especialidade], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, nome, especialidade });
      });
    });
  }

  // Listar todos os médicos
  static listar() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM medicos ORDER BY nome ASC';
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Buscar médico por ID
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM medicos WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Deletar médico
  static deletar(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM medicos WHERE id = ?';
      db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve({ mensagem: 'Médico deletado' });
      });
    });
  }

  // Atualizar foto do médico
  static atualizarFoto(id, foto) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE medicos SET foto = ? WHERE id = ?';
      db.run(sql, [foto, id], function(err) {
        if (err) reject(err);
        else resolve({ id, foto });
      });
    });
  }
}

module.exports = Medico;
