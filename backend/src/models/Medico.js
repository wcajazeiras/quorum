// Modelo de Médico
// Funções para gerenciar médicos no banco de dados

const db = require('../config/database');

class Medico {
  // Criar novo médico
  static criar(nome, especialidade, crm, telefone, email, uf, municipio, status) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO medicos (nome, especialidade, crm, telefone, email, uf, municipio, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(sql, [nome, especialidade, crm, telefone, email, uf, municipio, status], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, nome, especialidade, crm, telefone, email, uf, municipio, status });
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

  // Atualizar médico
  static atualizar(id, nome, especialidade, crm, telefone, email, uf, municipio, status) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE medicos
        SET nome = ?, especialidade = ?, crm = ?, telefone = ?, email = ?, uf = ?, municipio = ?, status = ?
        WHERE id = ?
      `;
      db.run(
        sql,
        [nome, especialidade, crm, telefone, email, uf, municipio, status, id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id, nome, especialidade, crm, telefone, email, uf, municipio, status });
        }
      );
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
}

module.exports = Medico;
