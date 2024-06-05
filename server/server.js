const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authenticateToken');

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
  const radius = 20000; // 20 km radius

  const promises = selectedOptions.map(async (option) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${option}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`;
    console.log(`Fetching URL: ${url}`);
    const response = await axios.get(url);
    console.log(`Response for ${option}:`, response.data);
    return response.data.results;
  });

  const placesArrays = await Promise.all(promises);
  const allPlaces = placesArrays.flat();
  console.log('All places fetched:', allPlaces);

  const sortedPlaces = allPlaces.sort((a, b) => b.rating - a.rating);
  const topRatedPlaces = sortedPlaces.slice(0, 6);
  const remainingPlaces = sortedPlaces.slice(6);

  const formatPlace = (place) => ({
    name: place.name,
    formatted_address: place.formatted_address,
    price_level: place.price_level,
    rating: place.rating,
    geometry: place.geometry,
    photos: place.photos?.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`) || []
  });

  const formattedTopRatedPlaces = topRatedPlaces.map(formatPlace);
  const formattedRemainingPlaces = remainingPlaces.map(formatPlace);

  console.log('Formatted top rated places:', formattedTopRatedPlaces);
  console.log('Formatted remaining places:', formattedRemainingPlaces);

  return {
    topRatedPlaces: formattedTopRatedPlaces,
    remainingPlaces: formattedRemainingPlaces
  };
}

//top-visited-places end point
app.get('/top-visited-places', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=top+tourist+attractions+in+Portugal&key=${apiKey}`;
    
    const response = await axios.get(url);
    const places = response.data.results.slice(0, 9); // Limita a 9 lugares

    const formattedPlaces = places.map(place => ({
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating,
      photos: place.photos?.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`) || []
    }));

    res.status(200).json({ places: formattedPlaces });
  } catch (error) {
    console.error('Error fetching top visited places:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to save roteiro
app.post('/save-roteiro', authenticateToken, async (req, res) => {
  const { rotName, selectedOptions, lat, lng } = req.body;
  const userId = req.user.userId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert new roteiro
    const rotResult = await client.query(
      'INSERT INTO "roteiro" (rot_name, rot_user_id) VALUES ($1, $2) RETURNING rot_id',
      [rotName, userId]
    );
    const rotId = rotResult.rows[0].rot_id;

    // Insert locations and associate with the roteiro
    for (const option of selectedOptions) {
      const localResult = await client.query(
        'INSERT INTO "local" (loc_name, loc_coo) VALUES ($1, ST_GeogFromText($2)) RETURNING loc_id',
        [option.name, `POINT(${option.geometry.location.lng} ${option.geometry.location.lat})`]
      );
      const locId = localResult.rows[0].loc_id;

      await client.query(
        'INSERT INTO "roteiroloc" (rotloc_rate, rotloc_rot_id, rotloc_loc_id) VALUES ($1, $2, $3)',
        [option.rating, rotId, locId]
      );
    }

    await client.query('COMMIT');
    client.release();

    res.status(201).json({ roteiroId: rotId });
  } catch (error) {
    console.error('Erro ao salvar roteiro:', error);
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get saved roteiros
app.get('/roteiros', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.rot_id, r.rot_name, array_agg(l.loc_name) AS loc_names
      FROM "roteiro" r
      JOIN "roteiroloc" rl ON r.rot_id = rl.rotloc_rot_id
      JOIN "local" l ON rl.rotloc_loc_id = l.loc_id
      WHERE r.rot_user_id = $1
      GROUP BY r.rot_id
    `, [req.user.userId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar roteiros:', error);
    res.status(500).json({ error: error.message });
  }
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
      'INSERT INTO "roteiro" (rot_name, rot_rotint_id, rot_user_id) VALUES ($1, $2, $3) RETURNING rot_id',
      [`roteiro de ${region}`, rotintId, userId]
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

  console.log('Received selectedOptions:', selectedOptions);
  console.log('Received lat:', lat);
  console.log('Received lng:', lng);

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const { topRatedPlaces, remainingPlaces } = await fetchPlaces(selectedOptions, lat, lng);
    res.status(200).json({ topRatedPlaces, remainingPlaces });
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
