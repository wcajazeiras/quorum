// Exemplo de utilidade
// Funções auxiliares reutilizáveis

const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR');
};

const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const gerarID = () => {
  return Math.random().toString(36).substr(2, 9);
};

module.exports = { formatarData, validarEmail, gerarID };
