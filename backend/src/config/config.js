// Exemplo de configuração
// Variáveis de ambiente e configurações da aplicação

module.exports = {
  porta: process.env.PORT || 3000,
  ambiente: process.env.NODE_ENV || 'development',
  banco: {
    host: process.env.DB_HOST,
    porta: process.env.DB_PORT,
    usuario: process.env.DB_USER,
    senha: process.env.DB_PASSWORD,
    nome: process.env.DB_NAME,
  },
  jwt: {
    chaveSecreta: process.env.JWT_SECRET,
  },
};
