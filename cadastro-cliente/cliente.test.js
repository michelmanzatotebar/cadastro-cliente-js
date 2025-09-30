const Cliente = require('./cliente');

describe('Cliente', () => {
    test('deve criar um cliente válido', () => {
        const cliente = new Cliente('João Silva', 'joao@email.com', 30, true);
        
        expect(cliente.nome).toBe('João Silva');
        expect(cliente.email).toBe('joao@email.com');
        expect(cliente.idade).toBe(30);
        expect(cliente.sexo).toBe(true);
    });

    test('deve validar cliente com dados corretos', () => {
        const cliente = new Cliente('Maria Santos', 'maria@email.com', 25, false);
        const validacao = cliente.validar();
        
        expect(validacao.valido).toBe(true);
    });

    test('deve rejeitar nome vazio', () => {
        const cliente = new Cliente('', 'teste@email.com', 30, true);
        const validacao = cliente.validar();
        
        expect(validacao.valido).toBe(false);
        expect(validacao.mensagem).toBe('Nome é obrigatório');
    });

    test('deve rejeitar email inválido', () => {
        const cliente = new Cliente('João', 'emailinvalido', 30, true);
        const validacao = cliente.validar();
        
        expect(validacao.valido).toBe(false);
        expect(validacao.mensagem).toBe('Email inválido');
    });

    test('deve rejeitar idade negativa', () => {
        const cliente = new Cliente('João', 'joao@email.com', -5, true);
        const validacao = cliente.validar();
        
        expect(validacao.valido).toBe(false);
        expect(validacao.mensagem).toBe('Idade inválida');
    });

    test('deve rejeitar idade acima de 150', () => {
        const cliente = new Cliente('João', 'joao@email.com', 200, true);
        const validacao = cliente.validar();
        
        expect(validacao.valido).toBe(false);
        expect(validacao.mensagem).toBe('Idade inválida');
    });

    test('deve rejeitar sexo inválido', () => {
        const cliente = new Cliente('João', 'joao@email.com', 30, 'invalido');
        const validacao = cliente.validar();
        
        expect(validacao.valido).toBe(false);
        expect(validacao.mensagem).toBe('Sexo inválido');
    });

    test('deve validar email corretamente', () => {
        const cliente = new Cliente('João', 'teste@email.com', 30, true);
        
        expect(cliente.validarEmail('teste@email.com')).toBe(true);
        expect(cliente.validarEmail('emailsemarroba.com')).toBe(false);
        expect(cliente.validarEmail('email@semponto')).toBe(false);
    });
});