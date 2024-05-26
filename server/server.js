const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // Adicione a importação do Pool do pg
const app = express();
const port = process.env.PORT || 4000;

// Configurar a conexão com o PostgreSQL
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'mydb',
  password: 'your_password',  // Substitua 'your_password' pela sua senha
  port: 5432,
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
    const result = await pool.query('SELECT * FROM "User"'); // Consulta a tabela User
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
  res.sendFile(path.join(__dirname, '../web/build', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
