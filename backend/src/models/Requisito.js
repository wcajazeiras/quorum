const db = require('../config/database');

class Requisito {
  static criar(editalId, texto, criticidade = 'Media', status = 'Em analise') {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO requisitos (editalId, texto, criticidade, status) VALUES (?, ?, ?, ?)';
      db.run(sql, [editalId, texto, criticidade, status], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, editalId, texto, criticidade, status });
      });
    });
  }
}

module.exports = Requisito;
