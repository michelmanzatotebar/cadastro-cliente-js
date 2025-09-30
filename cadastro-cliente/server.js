const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const Cliente = require('./cliente');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/api/clientes', async (req, res) => {
    try {
        const { nome, email, idade, sexo } = req.body;
        
        const cliente = new Cliente(nome, email, parseInt(idade), sexo === 'true' || sexo === true);
        const validacao = cliente.validar();
        
        if (!validacao.valido) {
            return res.status(400).json({ erro: validacao.mensagem });
        }

        const result = await pool.query(
            'INSERT INTO clientes (nome, email, idade, sexo) VALUES ($1, $2, $3, $4) RETURNING *',
            [cliente.nome, cliente.email, cliente.idade, cliente.sexo]
        );

        res.status(201).json(result.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao cadastrar cliente' });
    }
});

app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(result.rows);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar clientes' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});