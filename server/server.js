const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authenticateToken');
const axios = require('axios');

dotenv.config();

const app = express();
const port = 4000;

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'mydb',
  password: 'foobar',
  port: 5432,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendResetEmail(email, resetLink) {
  try {
    const mailOptions = {
      to: email,
      from: process.env.EMAIL,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetLink}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
}

async function fetchPlaces(selectedOptions, lat, lng) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const radius = 50000; // 50 km radius

  const promises = selectedOptions.map(async (option) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${option}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`;
    const response = await axios.get(url);
    return response.data.results;
  });

  const placesArrays = await Promise.all(promises);
  return placesArrays.flat();
}




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

app.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('SELECT * FROM "userwtg" WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Erro ao verificar e-mail:', error);
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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Received login data:', { email, password });

  try {
    const result = await pool.query('SELECT * FROM "userwtg" WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password_hash)) {
      console.log('User logged in successfully:', user);
      const accessToken = generateAccessToken({ userId: user.user_id, email: user.email });
      res.status(200).json({ token: accessToken, user: { id: user.user_id, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/google-login', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('INSERT INTO "userwtg" (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *', [email]);
    let user;
    if (result.rows.length > 0) {
      user = result.rows[0];
    } else {
      const selectResult = await pool.query('SELECT * FROM "userwtg" WHERE email = $1', [email]);
      user = selectResult.rows[0];
    }
    const accessToken = generateAccessToken({ userId: user.user_id, email: user.email });
    res.status(200).json({ token: accessToken, user: { id: user.user_id, email: user.email } });
  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "userwtg" WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (user.reset_token_expires && new Date(user.reset_token_expires) > new Date()) {
      const timeLeft = Math.ceil((new Date(user.reset_token_expires) - new Date()) / 60000);
      return res.status(429).json({ error: `Please wait ${timeLeft} minutes before requesting another password reset.` });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 300000);

    await pool.query(
      'UPDATE "userwtg" SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [resetToken, resetTokenExpires, email]
    );

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    await sendResetEmail(email, resetLink);

    res.status(200).json({ message: 'Reset email sent', token: resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/verify-reset-token', async (req, res) => {
  const { token } = req.query;

  try {
    const result = await pool.query('SELECT * FROM "userwtg" WHERE reset_token = $1 AND reset_token_expires > $2', [
      token,
      new Date(),
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Valid token' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "userwtg" WHERE reset_token = $1 AND reset_token_expires > $2', [
      token,
      new Date(),
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE "userwtg" SET password_hash = $1, reset_token = $2, reset_token_expires = $3 WHERE reset_token = $4', [
      hashedPassword,
      null,
      null,
      token,
    ]);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ errorx: error.message });
  }
});

app.post('/save-interests', authenticateToken, async (req, res) => {
  const { region, eatDuringTrip, selectedOptions } = req.body;
  const userId = req.user.userId;

  try {
    const client = await pool.connect();

    await client.query('BEGIN');

    const rotintResult = await client.query(
      'INSERT INTO "RoteiroInt" DEFAULT VALUES RETURNING rotint_id'
    );
    const rotintId = rotintResult.rows[0].rotint_id;

    for (const option of selectedOptions) {
      await client.query(
        'INSERT INTO "Interesse" (inter_name, inter_user_id, inter_rotint_id) VALUES ($1, $2, $3)',
        [option, userId, rotintId]
      );
    }

    const rotResult = await client.query(
      'INSERT INTO "Roteiro" (rot_name, rot_rotint_id, rot_user_id) VALUES ($1, $2, $3) RETURNING rot_id',
      [`Roteiro de ${region}`, rotintId, userId]
    );
    const rotId = rotResult.rows[0].rot_id;

    await client.query('COMMIT');
    client.release();

    res.status(201).json({ roteiroId: rotId });
  } catch (error) {
    console.error('Erro ao salvar interesses:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/get-places', async (req, res) => {
  const { selectedOptions, lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const places = await fetchPlaces(selectedOptions, lat, lng);
    res.status(200).json({ places });
  } catch (error) {
    console.error('Error fetching places:', error);
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



// app.get('/place-details', async (req, res) => {
//   const { place_id } = req.query;
//   const apiKey = process.env.GOOGLE_API_KEY;

//   if (!place_id) {
//     return res.status(400).json({ error: 'place_id is required' });
//   }

//   const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,price_level,user_ratings_total,geometry.location&key=${apiKey}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     if (data.status === 'OK') {
//       res.json(data.result);
//     } else {
//       console.error('Error fetching place details:', data);
//       res.status(500).json({ error: data.status, message: data.error_message });
//     }
//   } catch (error) {
//     console.error('Error fetching place details:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/place-stats', async (req, res) => {
//   const { city, type } = req.query; // Obtém cidade e tipo dos parâmetros de consulta
//   const apiKey = process.env.GOOGLE_API_KEY;

//   // Verifica se os parâmetros city e type foram fornecidos
//   if (!city || !type) {
//     return res.status(400).json({ error: 'city and type are required' });
//   }

//   // URL da API do Google Places para buscar lugares por cidade e tipo
//   const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${type}+in+${city}&key=${apiKey}`;

//   try {
//     const response = await fetch(url); // Faz a requisição para a API do Google Places
//     const data = await response.json(); // Converte a resposta em JSON
//     if (data.status !== 'OK') {
//       console.error('Error from Google Places API:', data);
//       return res.status(500).json({ error: data.status, message: data.error_message });
//     }

//     // Filtra os lugares para considerar apenas aqueles com mais de 100 avaliações
//     const places = data.results.filter(place => place.user_ratings_total > 100);
//     // Extrai as avaliações (ratings) dos lugares filtrados
//     const ratings = places.map(place => place.rating).filter(rating => rating !== undefined);

//     // Verifica se há avaliações suficientes para calcular as estatísticas
//     if (ratings.length === 0) {
//       return res.status(404).json({ error: 'No ratings found for the specified city and type with more than 100 reviews' });
//     }

//     // Calcula o total de avaliações
//     const totalRatings = ratings.reduce((sum, rating) => sum + rating, 0);
//     // Calcula a média das avaliações
//     const averageRating = totalRatings / ratings.length;
//     const marginOfError = 0.5; // Margem de erro fixa
//     const minRating = Math.min(...ratings); // Obtém a menor avaliação
//     const maxRating = Math.max(...ratings); // Obtém a maior avaliação

//     // Cria um objeto com as estatísticas
//     const stats = {
//       averageRating: averageRating.toFixed(2), // Formata a média para 2 casas decimais
//       marginOfError: marginOfError.toFixed(2), // Formata a margem de erro para 2 casas decimais
//       minRating, // Pior avaliação
//       maxRating // Melhor avaliação
//     };

//     res.json(stats); // Retorna as estatísticas como resposta
//   } catch (error) {
//     console.error('Error fetching place stats:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// const fetchPlaceCounts = async (type) => {
//   const apiKey = process.env.GOOGLE_API_KEY;
//   const cities = ["Lisboa", "Sintra", "Vila Nova de Gaia", "Porto", "Cascais"];
//   const results = {};

//   for (const city of cities) {
//     const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${type}+in+${city}&key=${apiKey}`;
//     try {
//       const response = await fetch(url);
//       const data = await response.json();
//       if (data.status === 'OK') {
//         results[city] = data.results.length;
//       } else {
//         console.error(`Error from Google Places API for ${city}:`, data);
//         results[city] = 0;
//       }
//     } catch (error) {
//       console.error(`Error fetching places for ${city}:`, error);
//       results[city] = 0;
//     }
//   }

//   return results;
// };

// // Nova rota para obter a quantidade de locais por cidade
// app.get('/place-counts', async (req, res) => {
//   const { type } = req.query;
//   if (!type) {
//     return res.status(400).json({ error: 'type is required' });
//   }

//   try {
//     const counts = await fetchPlaceCounts(type);
//     res.json(counts);
//   } catch (error) {
//     console.error('Error fetching place counts:', error);
//     res.status(500).json({ error: error.message });
//   }
// });
