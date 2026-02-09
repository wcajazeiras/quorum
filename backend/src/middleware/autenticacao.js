// Exemplo de middleware
// Executado antes de chegar ao controlador

const verificarAutenticacao = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  // Validar token aqui (verificar JWT)
  // Se válido, chamar próximo middleware
  next();
};

const tratarErros = (erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor' });
};

module.exports = { verificarAutenticacao, tratarErros };
