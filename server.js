const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const Cliente = require('./cliente');
const promClient = require('prom-client');

const app = express();
const PORT = 3000;

const register = new promClient.Registry();

promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: ['method', 'route', 'status_code']
});

const clientesCadastradosTotal = new promClient.Counter({
    name: 'clientes_cadastrados_total',
    help: 'Total de clientes cadastrados'
});

const clientesAtivos = new promClient.Gauge({
    name: 'clientes_ativos_total',
    help: 'Total de clientes ativos no banco'
});

const idadeMediaClientes = new promClient.Gauge({
    name: 'idade_media_clientes',
    help: 'Idade média dos clientes cadastrados'
});

// Registrar métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(clientesCadastradosTotal);
register.registerMetric(clientesAtivos);
register.registerMetric(idadeMediaClientes);

app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        
        httpRequestDuration
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration);
        
        httpRequestsTotal
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .inc();
    });
    
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Endpoint de métricas para o Prometheus
app.get('/metrics', async (req, res) => {
    try {
        const totalClientes = await pool.query('SELECT COUNT(*) as total FROM clientes');
        clientesAtivos.set(parseInt(totalClientes.rows[0].total));
        
        const mediaIdade = await pool.query('SELECT AVG(idade) as media FROM clientes');
        if (mediaIdade.rows[0].media) {
            idadeMediaClientes.set(parseFloat(mediaIdade.rows[0].media));
        }
        
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (erro) {
        res.status(500).end(erro);
    }
});

// Endpoint para cadastrar cliente
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

        clientesCadastradosTotal.inc();

        res.status(201).json(result.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao cadastrar cliente' });
    }
});

// Endpoint para listar clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(result.rows);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar clientes' });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Métricas disponíveis em http://localhost:${PORT}/metrics`);
});