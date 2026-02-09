# 📋 Quorum - MVP de Gestão de Contratos Públicos de Saúde

Plataforma web para demonstrar a execução de contratos públicos com evidências mínimas para prestação de contas ao Tribunal de Contas.

## ✨ Visão Geral

**Quorum** é um MVP simples e funcional que permite:

- ✅ Cadastrar Editais (número, órgão, vigência)
- ✅ Cadastrar Contratos (vinculados aos editais)
- ✅ Cadastrar Médicos (nome, especialidade)
- ✅ Registrar Plantões (data, carga horária)
- ✅ Registrar Atendimentos (descrição do atendimento)
- ✅ Gerar Relatórios de Execução

**Foco**: Demonstrar comprovação de serviços prestados e facilitar auditoria.

## 🚀 Como Rodar (30 segundos)

### Opção 1: Windows
```bash
cd backend
npm install
npm start
```

### Opção 2: Linux/Mac
```bash
cd backend
npm install
npm start
```

Então abra no navegador: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
quorum/
├── backend/                # API + Frontend
│   ├── src/               # Código-fonte
│   ├── public/            # HTML + CSS + JS
│   ├── package.json       # Dependências
│   └── server.js          # Inicia servidor
├── README.md              # Este arquivo
└── .env                   # Configurações (não commitar)
```

## 🏗️ Arquitetura Simples

```
┌─────────────────────────────────────────────┐
│  Browser (http://localhost:3000)            │
│  - HTML simples                             │
│  - CSS básico                               │
│  - JavaScript vanilla (sem frameworks)      │
└────────────────┬────────────────────────────┘
                 │ API Calls (JSON)
┌────────────────▼────────────────────────────┐
│  Express.js Server (http://localhost:3000)  │
│  - Routes: /api/editais, /api/medicos, ... │
│  - Controllers: Processam requisições       │
│  - Services: Lógica de negócio              │
├────────────────────────────────────────────┤
│  SQLite Database (local)                    │
│  - Arquivo: data/quorum.db                 │
│  - Tabelas: editais, médicos, plantões...   │
└────────────────────────────────────────────┘
```

## 📚 API Endpoints

Todos em: `http://localhost:3000/api/`

### Editais
```
GET    /editais           → Lista todos
POST   /editais           → Cria novo
DELETE /editais/:id       → Deleta
```

### Médicos
```
GET    /medicos           → Lista todos
POST   /medicos           → Cria novo
DELETE /medicos/:id       → Deleta
```

### Plantões
```
GET    /plantoes          → Lista todos
POST   /plantoes          → Cria novo
DELETE /plantoes/:id      → Deleta
```

### Atendimentos
```
GET    /atendimentos      → Lista todos
POST   /atendimentos      → Cria novo
DELETE /atendimentos/:id  → Deleta
```

### Relatórios
```
GET    /relatorios/geral                      → Todos os médicos
GET    /relatorios/medico/:id                 → De um médico
```

## 🗂️ Estrutura do Backend

```
backend/src/
├── config/database.js       ← Cria banco SQLite
├── controllers/             ← Recebem requisições HTTP
│   ├── editaisController.js
│   ├── medicosController.js
│   ├── plantõesController.js
│   ├── atendimentosController.js
│   └── relatorioController.js
├── services/                ← Lógica de negócio
│   ├── editaisService.js
│   ├── medicosService.js
│   ├── plantõesService.js
│   └── atendimentosService.js
├── models/                  ← Interagem com banco
│   ├── Edital.js
│   ├── Medico.js
│   ├── Plantao.js
│   └── Atendimento.js
└── routes/                  ← Mapeiam URLs
    ├── editaisRoutes.js
    ├── medicosRoutes.js
    └── ...
```

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar com auto-reload (desenvolvimento)
npm run dev

# Rodar normalmente (produção)
npm start

# Testar um endpoint
curl http://localhost:3000/api/health

# Mudar de porta
PORT=3001 npm start

# Ver estrutura do banco
sqlite3 data/quorum.db".schema"
```

## 📦 Dependências

- **express** - Framework web
- **sqlite3** - Banco de dados local
- **cors** - Permitir requisições HTTP
- **dotenv** - Variáveis de ambiente

## 🚀 Deploy - 3 Opções

### Opção 1: Render.com (Recomendado)
1. Fazer push no GitHub
2. Ir em render.com → New → Web Service
3. Conectar repositório
4. Build: `npm install`
5. Start: `npm start`
6. Deploy

### Opção 2: Railway.app
1. Criar conta
2. Conectar GitHub
3. Railway detecta Node.js automaticamente
4. Deploy com git push

### Opção 3: Heroku (Gratuito já não existe)
Use Render ou Railway.

## 🎯 Como Usar a Plataforma

1. **Abrir** http://localhost:3000
2. **Criar um Edital** na aba "Editais"
3. **Criar um Contrato** vinculado ao edital
4. **Criar Médicos** na aba "Médicos"
5. **Registrar Plantões** na aba "Plantões"
6. **Registrar Atendimentos** na aba "Atendimentos"
7. **Ver Relatório** na aba "Relatórios"

## 🔍 Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro: "Cannot find module 'sqlite3'" | `npm install` |
| Porta 3000 já em uso | `PORT=3001 npm start` |
| Banco de dados não criou | Verificar permissões da pasta `data/` |
| API retorna erro 404 | Backend rodando? Porta correta? |
| Frontend não carrega | Checar se `public/index.html` existe |

## 📊 Dados de Exemplo

Após rodar, teste criando:

1. **Edital**: 
   - Número: "001/2024"
   - Órgão: "Prefeitura Municipal"
   - Vigência: "2024-2026"

2. **Médico**:
   - Nome: "Dr. João Silva"
   - Especialidade: "Cardiologia"

3. **Plantão**:
   - Data: 2024-02-10
   - Carga: 8 horas

4. **Atendimento**:
   - Data: 2024-02-10
   - Descrição: "Consulta de rotina"

## ✅ Features Implementadas

- [x] Cadastro de Editais
- [x] Cadastro de Contratos
- [x] Cadastro de Médicos
- [x] Registro de Plantões
- [x] Registro de Atendimentos
- [x] Relatórios básicos
- [x] Frontend funcional
- [x] Banco de dados automático
- [x] Deploy pronto

## 📋 Roadmap (Futuro)

- [ ] Autenticação JWT
- [ ] Upload de arquivos
- [ ] Exportar PDF
- [ ] Enviar emails
- [ ] Gráficos e dashboards
- [ ] Testes automatizados
- [ ] App mobile
- [ ] Alertas de inconformidade

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Deploy**: Render.com / Railway.app

## 📝 Licença

MIT

## 👨‍💼 Para Gestores Públicos

Este MVP demonstra:
1. ✅ Comprovação de execução de contrato
2. ✅ Registro de serviços prestados
3. ✅ Rastreabilidade de atividades
4. ✅ Facilita auditoria

## 🤝 Contribuindo

Para contribuir:
1. Fazer fork
2. Criar branch (`git checkout -b feature/novidade`)
3. Commit (`git commit -am 'Add nova feature'`)
4. Push (`git push origin feature/novidade`)
5. Abrir Pull Request

---

**Desenvolvido com ❤️ para modernizar a gestão pública de saúde.**


