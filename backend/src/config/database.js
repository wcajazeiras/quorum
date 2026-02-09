// Configuração do banco de dados SQLite
// Este arquivo inicializa o banco de dados e cria as tabelas

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para armazenar o banco de dados
const dbPath = path.join(__dirname, '../../data/quorum.db');

// Criar pasta de dados se não existir
const fs = require('fs');
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Conectar ao banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('✓ Conectado ao banco de dados SQLite');
  }
});

// Criar tabelas quando o app inicia
db.serialize(() => {
  // Tabela de Editais
  db.run(`
    CREATE TABLE IF NOT EXISTS editais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT UNIQUE NOT NULL,
      orgao TEXT NOT NULL,
      tipoOrgao TEXT NOT NULL DEFAULT 'Município',
      estado TEXT,
      municipio TEXT,
      vigencia TEXT NOT NULL,
      objeto TEXT,
      resumo TEXT,
      pdfNome TEXT,
      dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const ensureColumn = (table, column, type) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) return;
      const exists = rows.some(row => row.name === column);
      if (!exists) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
      }
    });
  };

  ensureColumn('editais', 'objeto', 'TEXT');
  ensureColumn('editais', 'resumo', 'TEXT');
  ensureColumn('editais', 'pdfNome', 'TEXT');

  // Tabela de Requisitos
  db.run(`
    CREATE TABLE IF NOT EXISTS requisitos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      editalId INTEGER NOT NULL,
      texto TEXT NOT NULL,
      criticidade TEXT DEFAULT 'Media',
      status TEXT DEFAULT 'Em analise',
      dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (editalId) REFERENCES editais(id)
    )
  `);

  // Tabela de Anexos
  db.run(`
    CREATE TABLE IF NOT EXISTS anexos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      editalId INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      fonte TEXT DEFAULT 'edital',
      link TEXT,
      schemaJson TEXT,
      dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (editalId) REFERENCES editais(id)
    )
  `);

  // Tabela de Tarefas
  db.run(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      editalId INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT,
      status TEXT DEFAULT 'pendente',
      dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (editalId) REFERENCES editais(id)
    )
  `);

  // Tabela de Contratos
  db.run(`
    CREATE TABLE IF NOT EXISTS contratos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      editalId INTEGER NOT NULL,
      dataInicio DATE NOT NULL,
      dataFim DATE NOT NULL,
      status TEXT DEFAULT 'ativo',
      dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (editalId) REFERENCES editais(id)
    )
  `);

  // Tabela de Médicos
  db.run(`
    CREATE TABLE IF NOT EXISTS medicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      especialidade TEXT NOT NULL,
      crm TEXT,
      telefone TEXT,
      email TEXT,
      uf TEXT,
      municipio TEXT,
      status TEXT DEFAULT 'ativo',
      dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  ensureColumn('medicos', 'crm', 'TEXT');
  ensureColumn('medicos', 'telefone', 'TEXT');
  ensureColumn('medicos', 'email', 'TEXT');
  ensureColumn('medicos', 'uf', 'TEXT');
  ensureColumn('medicos', 'municipio', 'TEXT');
  ensureColumn('medicos', 'status', 'TEXT');

  // Tabela de Plantões
  db.run(`
    CREATE TABLE IF NOT EXISTS plantoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicoId INTEGER NOT NULL,
      data DATE NOT NULL,
      cargaHoraria REAL NOT NULL,
      dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medicoId) REFERENCES medicos(id)
    )
  `);

  // Tabela de Atendimentos
  db.run(`
    CREATE TABLE IF NOT EXISTS atendimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicoId INTEGER NOT NULL,
      data DATE NOT NULL,
      descricao TEXT NOT NULL,
      dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medicoId) REFERENCES medicos(id)
    )
  `);
});

function seedSampleData() {
  db.get('SELECT COUNT(*) AS total FROM editais', (err, editaisRow) => {
    if (err || editaisRow.total > 0) return;

    db.get('SELECT COUNT(*) AS total FROM contratos', (contratosErr, contratosRow) => {
      if (contratosErr || contratosRow.total > 0) return;

      db.get('SELECT COUNT(*) AS total FROM medicos', (medicosErr, medicosRow) => {
        if (medicosErr || medicosRow.total > 0) return;

        db.get('SELECT COUNT(*) AS total FROM plantoes', (plantoesErr, plantoesRow) => {
          if (plantoesErr || plantoesRow.total > 0) return;

          db.serialize(() => {
            const editais = [
              ['001/2026', 'Secretaria Municipal de Saude', 'Municipal', 'SP', 'Sao Paulo', '2026'],
              ['002/2026', 'Secretaria Estadual de Saude', 'Estadual', 'RJ', 'Rio de Janeiro', '2026'],
              ['003/2026', 'Hospital Regional Centro', 'Federal', 'DF', 'Brasilia', '2026']
            ];

            editais.forEach(edital => {
              db.run(
                'INSERT INTO editais (numero, orgao, tipoOrgao, estado, municipio, vigencia) VALUES (?, ?, ?, ?, ?, ?)',
                edital
              );
            });

            db.all(
              'SELECT id, numero FROM editais WHERE numero IN (?, ?, ?)',
              editais.map(edital => edital[0]),
              (editaisSelectErr, rows) => {
                if (editaisSelectErr) return;
                const editalMap = new Map(rows.map(row => [row.numero, row.id]));

                const contratos = [
                  ['001/2026', '2026-01-15', '2026-06-30', 'ativo'],
                  ['002/2026', '2026-02-01', '2026-08-30', 'suspenso'],
                  ['003/2026', '2025-07-01', '2026-01-31', 'encerrado']
                ];

                contratos.forEach(contrato => {
                  const editalId = editalMap.get(contrato[0]);
                  if (!editalId) return;
                  db.run(
                    'INSERT INTO contratos (editalId, dataInicio, dataFim, status) VALUES (?, ?, ?, ?)',
                    [editalId, contrato[1], contrato[2], contrato[3]]
                  );
                });
              }
            );

            const medicos = [
              ['Roberto Silva', 'Cardiologia', 'CRM 12345/SP', '(11) 98888-0001', 'roberto@hospital.com', 'SP', 'Sao Paulo', 'ativo'],
              ['Maria Santos', 'Cirurgia Geral', 'CRM 23456/RJ', '(21) 97777-0002', 'maria@hospital.com', 'RJ', 'Rio de Janeiro', 'ativo'],
              ['Joao Costa', 'Pediatria', 'CRM 34567/DF', '(61) 96666-0003', 'joao@hospital.com', 'DF', 'Brasilia', 'ativo'],
              ['Ana Louise', 'Oftalmologia', 'CRM 45678/MG', '(31) 95555-0004', 'ana@hospital.com', 'MG', 'Belo Horizonte', 'ativo'],
              ['Paulo Oliveira', 'Ortopedia', 'CRM 56789/RS', '(51) 94444-0005', 'paulo@hospital.com', 'RS', 'Porto Alegre', 'inativo']
            ];

            medicos.forEach(medico => {
              db.run(
                'INSERT INTO medicos (nome, especialidade, crm, telefone, email, uf, municipio, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                medico
              );
            });

            db.all(
              'SELECT id, nome FROM medicos WHERE nome IN (?, ?, ?, ?)',
              medicos.map(medico => medico[0]),
              (medicosSelectErr, rows) => {
                if (medicosSelectErr) return;
                const medicoMap = new Map(rows.map(row => [row.nome, row.id]));

                const plantoes = [
                  ['Roberto Silva', '2026-02-04', 8],
                  ['Maria Santos', '2026-02-07', 12],
                  ['Joao Costa', '2026-02-10', 12],
                  ['Ana Louise', '2026-02-12', 8],
                  ['Roberto Silva', '2026-01-15', 12]
                ];

                plantoes.forEach(plantao => {
                  const medicoId = medicoMap.get(plantao[0]);
                  if (!medicoId) return;
                  db.run(
                    'INSERT INTO plantoes (medicoId, data, cargaHoraria) VALUES (?, ?, ?)',
                    [medicoId, plantao[1], plantao[2]]
                  );
                });
              }
            );
          });
        });
      });
    });
  });
}

seedSampleData();

module.exports = db;
