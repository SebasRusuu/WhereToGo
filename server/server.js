const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// Middleware para servir arquivos estáticos da pasta build
app.use(express.static(path.join(__dirname, '../web/build')));

// Endpoint de exemplo para a API
app.get('/api/data', (req, res) => {
    res.json({ message: 'Aqui está sua API!' });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Rota para servir o frontend React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/web/build', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
