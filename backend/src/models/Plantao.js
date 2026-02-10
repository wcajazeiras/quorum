// Modelo de Plantão
// Funções para gerenciar plantões no banco de dados

const db = require('../config/database');

class Plantao {
  // Criar novo plantão
  static criar(medicoId, data, cargaHoraria, contratoId) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO plantoes (medicoId, data, cargaHoraria, contratoId) VALUES (?, ?, ?, ?)';
      db.run(sql, [medicoId, data, cargaHoraria, contratoId || null], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, medicoId, data, cargaHoraria, contratoId });
      });
    });
  }

  // Listar todos os plantões
  static listar() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT plantoes.*,
               medicos.nome, medicos.especialidade, medicos.municipio, medicos.uf,
               contratos.numero AS contratoNumero,
               editais.orgao AS contratoOrgao
        FROM plantoes
        LEFT JOIN medicos ON plantoes.medicoId = medicos.id
        LEFT JOIN contratos ON plantoes.contratoId = contratos.id
        LEFT JOIN editais ON contratos.editalId = editais.id
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
        SELECT plantoes.*,
               medicos.nome, medicos.especialidade, medicos.municipio, medicos.uf,
               contratos.numero AS contratoNumero
        FROM plantoes
        LEFT JOIN medicos ON plantoes.medicoId = medicos.id
        LEFT JOIN contratos ON plantoes.contratoId = contratos.id
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
  static atualizar(id, medicoId, data, cargaHoraria, contratoId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE plantoes
        SET medicoId = ?, data = ?, cargaHoraria = ?, contratoId = ?
        WHERE id = ?
      `;
      db.run(sql, [medicoId, data, cargaHoraria, contratoId || null, id], function(err) {
        if (err) reject(err);
        else resolve({ id, medicoId, data, cargaHoraria, contratoId });
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
