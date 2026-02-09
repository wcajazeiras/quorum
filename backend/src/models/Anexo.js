const db = require('../config/database');

class Anexo {
  static criar(editalId, titulo, fonte = 'edital', link = '', schemaJson = '') {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO anexos (editalId, titulo, fonte, link, schemaJson) VALUES (?, ?, ?, ?, ?)';
      db.run(sql, [editalId, titulo, fonte, link, schemaJson], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, editalId, titulo, fonte, link, schemaJson });
      });
    });
  }
}

module.exports = Anexo;
