document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();

    document.getElementById('formCliente').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const idade = document.getElementById('idade').value;
        const sexo = document.querySelector('input[name="sexo"]:checked').value;

        try {
            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, email, idade, sexo })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarMensagem('Cliente cadastrado com sucesso!', 'sucesso');
                document.getElementById('formCliente').reset();
                carregarClientes();
            } else {
                mostrarMensagem(data.erro || 'Erro ao cadastrar cliente', 'erro');
            }
        } catch (erro) {
            mostrarMensagem('Erro ao cadastrar cliente', 'erro');
        }
    });
});

async function carregarClientes() {
    try {
        const response = await fetch('/api/clientes');
        const clientes = await response.json();
        
        const tbody = document.querySelector('#tabelaClientes tbody');
        tbody.innerHTML = '';

        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.email}</td>
                <td>${cliente.idade}</td>
                <td>${cliente.sexo ? 'Masculino' : 'Feminino'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) {
        console.error('Erro ao carregar clientes:', erro);
    }
}

function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById('mensagem');
    mensagem.textContent = texto;
    mensagem.className = tipo;
    
    setTimeout(() => {
        mensagem.style.display = 'none';
    }, 3000);
}