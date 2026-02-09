const db = require('../config/database');

class Tarefa {
  static criar(editalId, titulo, descricao = '', status = 'pendente') {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO tarefas (editalId, titulo, descricao, status) VALUES (?, ?, ?, ?)';
      db.run(sql, [editalId, titulo, descricao, status], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, editalId, titulo, descricao, status });
      });
    });
  }
}

module.exports = Tarefa;
