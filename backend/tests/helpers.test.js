// Exemplo de teste
// Testes unitários para validar a lógica

test('deve validar email corretamente', () => {
  const { validarEmail } = require('../src/utils/helpers');
  
  expect(validarEmail('teste@email.com')).toBe(true);
  expect(validarEmail('email_invalido')).toBe(false);
});
