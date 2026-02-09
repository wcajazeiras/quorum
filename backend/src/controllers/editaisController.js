// Controller de Editais
// Recebe requisições HTTP e chama os serviços

const EditaisService = require('../services/editaisService');

class EditaisController {
  // GET /api/editais - Listar todos os editais
  async listar(req, res) {
    try {
      const editais = await EditaisService.listarEditais();
      res.json(editais);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  }

  // POST /api/editais - Criar novo edital
  async criar(req, res) {
    try {
      const edital = await EditaisService.criarEdital(req.body);
      res.status(201).json(edital);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // POST /api/editais/analisar - Analisar PDF do edital
  async analisar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Arquivo PDF não enviado' });
      }

      let annexLinks = [];
      if (req.body && req.body.annexLinks) {
        try {
          annexLinks = JSON.parse(req.body.annexLinks);
        } catch (parseError) {
          annexLinks = [];
        }
      }
      const resultado = await EditaisService.analisarEditalPdf(req.file.buffer, req.file.originalname, annexLinks);
      res.json(resultado);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // GET /api/editais/:id - Buscar edital por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const edital = await EditaisService.buscarEditaisPorId(id);
      res.json(edital);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }

  // DELETE /api/editais/:id - Deletar edital
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const resultado = await EditaisService.deletarEdital(id);
      res.json(resultado);
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  }
}

module.exports = new EditaisController();
