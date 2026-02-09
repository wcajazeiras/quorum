// Modelo de Plantão
// Funções para gerenciar plantões no banco de dados

const db = require('../config/database');

class Plantao {
  // Criar novo plantão
  static criar(medicoId, data, cargaHoraria) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO plantoes (medicoId, data, cargaHoraria) VALUES (?, ?, ?)';
      db.run(sql, [medicoId, data, cargaHoraria], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, medicoId, data, cargaHoraria });
      });
    });
  }

  // Listar todos os plantões
  static listar() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT plantoes.*, medicos.nome, medicos.especialidade, medicos.municipio, medicos.uf
        FROM plantoes
        LEFT JOIN medicos ON plantoes.medicoId = medicos.id
        ORDER BY plantoes.data DESC
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Buscar plantões de um médico
  static buscarPorMedico(medicoId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT plantoes.*, medicos.nome, medicos.especialidade, medicos.municipio, medicos.uf
        FROM plantoes
        LEFT JOIN medicos ON plantoes.medicoId = medicos.id
        WHERE plantoes.medicoId = ?
        ORDER BY plantoes.data DESC
      `;
      db.all(sql, [medicoId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Atualizar plantão
  static atualizar(id, medicoId, data, cargaHoraria) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE plantoes
        SET medicoId = ?, data = ?, cargaHoraria = ?
        WHERE id = ?
      `;
      db.run(sql, [medicoId, data, cargaHoraria, id], function(err) {
        if (err) reject(err);
        else resolve({ id, medicoId, data, cargaHoraria });
      });
    });
  }

  // Deletar plantão
  static deletar(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM plantoes WHERE id = ?';
      db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve({ mensagem: 'Plantão deletado' });
      });
    });
  }
}

module.exports = Plantao;
