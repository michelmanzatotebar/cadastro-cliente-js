const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cadastro_clientes',
    password: 'michel',
    port: 5432,
});

module.exports = pool;