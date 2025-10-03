class Cliente {
    constructor(nome, email, idade, sexo) {
        this.nome = nome;
        this.email = email;
        this.idade = idade;
        this.sexo = sexo;
    }

    validar() {
        if (!this.nome || this.nome.trim() === '') {
            return { valido: false, mensagem: 'Nome é obrigatório' };
        }
        
        if (!this.email || !this.validarEmail(this.email)) {
            return { valido: false, mensagem: 'Email inválido' };
        }
        
        if (!this.idade || this.idade < 0 || this.idade > 150) {
            return { valido: false, mensagem: 'Idade inválida' };
        }
        
        if (typeof this.sexo !== 'boolean') {
            return { valido: false, mensagem: 'Sexo inválido' };
        }
        
        return { valido: true };
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
}

module.exports = Cliente;