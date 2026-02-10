// Modelo de Edital
// Funções para gerenciar editais no banco de dados

const db = require('../config/database');

class Edital {
  // Criar novo edital
  static criar(numero, orgao, tipoOrgao, estado, municipio, vigencia, objeto, resumo, pdfNome, status, pncpNumeroControle, linkSistemaOrigem) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO editais (numero, orgao, tipoOrgao, estado, municipio, vigencia, objeto, resumo, pdfNome, status, pncpNumeroControle, linkSistemaOrigem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.run(sql, [numero, orgao, tipoOrgao, estado, municipio, vigencia, objeto, resumo, pdfNome, status || 'aberto', pncpNumeroControle || null, linkSistemaOrigem || null], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, numero, orgao, tipoOrgao, estado, municipio, vigencia, objeto, resumo, pdfNome, status: status || 'aberto', pncpNumeroControle, linkSistemaOrigem });
      });
    });
  }

  // Atualizar edital
  static atualizar(id, numero, orgao, tipoOrgao, estado, municipio, vigencia, objeto, resumo, pdfNome, status) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE editais
        SET numero = ?, orgao = ?, tipoOrgao = ?, estado = ?, municipio = ?, vigencia = ?, objeto = ?, resumo = ?, pdfNome = ?, status = ?
        WHERE id = ?
      `;
      db.run(sql, [numero, orgao, tipoOrgao, estado, municipio, vigencia, objeto, resumo, pdfNome, status, id], function(err) {
        if (err) reject(err);
        else resolve({ id, numero, orgao, tipoOrgao, estado, municipio, vigencia, objeto, resumo, pdfNome, status });
      });
    });
  }

  // Listar todos os editais
  static listar() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM editais ORDER BY dataCriacao DESC';
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Buscar edital por ID
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM editais WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Buscar edital por número de controle PNCP
  static buscarPorPncp(pncpNumeroControle) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM editais WHERE pncpNumeroControle = ?';
      db.get(sql, [pncpNumeroControle], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Deletar edital
  static deletar(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM editais WHERE id = ?';
      db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve({ mensagem: 'Edital deletado' });
      });
    });
  }
}

module.exports = Edital;
