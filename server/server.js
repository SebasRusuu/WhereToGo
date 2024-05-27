const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const app = express();
const port = 4000;

app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'mydb',
    password: 'foobar',
    port:5432,
});

app.use(express.static(path.join(__dirname, '../web/build')));

app.get('/data', (req, res) => {
    res.json({ message: 'Aqui está sua API!' });
});

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "userwtg"');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log('Received registration data:', { firstName, lastName, email, password });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        const result = await pool.query(
            'INSERT INTO "userwtg" (firstName, lastName, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
            [firstName, lastName, email, hashedPassword]
        );
        console.log('User registered successfully:', result);

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: error.message });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
