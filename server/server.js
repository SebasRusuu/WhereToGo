const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const app = express();
const port = 4000;

// Configurar a conexão com o PostgreSQL
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT || 5432,
  });

// Middleware para servir arquivos estáticos da pasta build
app.use(express.static(path.join(__dirname, '../web/build')));

// Endpoint de exemplo para a API
app.get('/api/data', (req, res) => {
  res.json({ message: 'Aqui está sua API!' });
});

// Novo endpoint para obter usuários do banco de dados
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "userWtg"'); // Nome da tabela corrigido
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Rota para servir o frontend React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/build', 'index.html')); // Certifique-se de que o caminho está correto
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
