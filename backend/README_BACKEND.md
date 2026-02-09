# Backend - Quorum MVP

Sistema simples de gestão de contratos públicos de saúde.

## 🚀 Quick Start (60 segundos)

```bash
cd backend
npm install
npm start
```

Abra: **http://localhost:3000**

## 📋 Funcionalidades

- ✅ Cadastro de Editais
- ✅ Cadastro de Contratos
- ✅ Cadastro de Médicos
- ✅ Registro de Plantões
- ✅ Registro de Atendimentos
- ✅ Relatórios de Execução

## 🏗️ Arquitetura

```
Frontend (HTML/CSS/JS) → API REST → Database (SQLite)
   public/index.html      server.js    data/quorum.db
```

## 📁 Estrutura de Código

```
src/
├── config/          Banco de dados (SQLite)
├── controllers/     Recebem requisições HTTP
├── services/        Validam e processam dados
├── models/          Salvam/buscam no banco
├── routes/          Mapeiam URL → Controller
└── middleware/      Processam requisições
```

## 📚 API Endpoints

| Método | URL | Descrição |
|--------|-----|-----------|
| GET | /api/editais | Listar editais |
| POST | /api/editais | Criar edital |
| DELETE | /api/editais/:id | Deletar edital |
| GET | /api/medicos | Listar médicos |
| POST | /api/medicos | Criar médico |
| GET | /api/plantoes | Listar plantões |
| POST | /api/plantoes | Criar plantão |
| GET | /api/atendimentos | Listar atendimentos |
| POST | /api/atendimentos | Criar atendimento |
| GET | /api/relatorios/geral | Relatório geral |

## 🗄️ Banco de Dados

Arquivo automático: `data/quorum.db`

Tabelas:
- editais
- contratos
- medicos
- plantoes
- atendimentos

## 🔧 Desenvolvimento

```bash
npm run dev    # Auto-reload
npm start      # Produção
npm test       # Testes
```

## 🚀 Deploy (Render.com)

1. Push para GitHub
2. Criar projeto no Render
3. Build: `npm install`
4. Start: `npm start`

## 💡 Atalhos Úteis

Testar API:
```bash
curl http://localhost:3000/api/health
```

Ver logs:
```bash
node server.js
```

Porta diferente:
```bash
PORT=3001 npm start
```

