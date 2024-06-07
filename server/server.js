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
app.use(cors({
  origin: 'https://wheretogoweb.onrender.com' // Permitir requisições do frontend
}));

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

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distância em km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
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

  // Adicionar cálculo de distância a cada local
  allPlaces.forEach(place => {
    place.distance = getDistanceFromLatLonInKm(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
  });

  // Ordenar por proximidade e depois por classificação
  const sortedPlaces = allPlaces.sort((a, b) => {
    const distanceDiff = a.distance - b.distance;
    if (distanceDiff === 0) {
      return b.rating - a.rating;
    }
    return distanceDiff;
  });

  const topRatedPlaces = sortedPlaces.slice(0, 6);
  const remainingPlaces = sortedPlaces.slice(6);

  const formatPlace = (place) => ({
    name: place.name,
    formatted_address: place.formatted_address,
    price_level: place.price_level,
    rating: place.rating,
    geometry: place.geometry,
    photos: place.photos?.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`) || [],
    distance: place.distance
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

// Endpoint to fetch top visited places
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

// Endpoint to get saved roteiros
app.get('/roteiros/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(`
      SELECT r.rot_id, r.rot_name, array_agg(json_build_object(
        'name', l.loc_name,
        'geometry', json_build_object(
          'location', json_build_object(
            'lat', ST_Y(l.loc_coo::geometry),
            'lng', ST_X(l.loc_coo::geometry)
          )
        ),
        'formatted_address', l.loc_name,
        'rating', rl.rotloc_rate,
        'photos', array(SELECT json_build_object('photo_reference', p.photo_reference) FROM place_photos p WHERE p.place_id = l.loc_id)
      )) AS places
      FROM "roteiro" r
      JOIN "roteiroloc" rl ON r.rot_id = rl.rotloc_rot_id
      JOIN "local" l ON rl.rotloc_loc_id = l.loc_id
      WHERE r.rot_id = $1 AND r.rot_user_id = $2
      GROUP BY r.rot_id
    `, [id, userId]);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar roteiro:', error);
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

app.get('/places-to-visit', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { placeType, region } = req.query;
    let query = 'tourist+attractions+in+Portugal';

    if (placeType) {
      query += `+${placeType}`;
    }
    if (region) {
      query += `+${region}`;
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

    const response = await axios.get(url);
    const places = response.data.results;

    const formattedPlaces = places.map(place => ({
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating,
      photos: place.photos?.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`) || [],
      placeType: place.types.find(type => type.includes('point_of_interest') || type.includes('establishment')) || 'outro',
      region: place.plus_code ? place.plus_code.compound_code.split(' ')[1] : 'Portugal' // Exemplo para pegar a região do plus code
    }));

    res.status(200).json({ places: formattedPlaces });
  } catch (error) {
    console.error('Error fetching places to visit:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/places-to-eat', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const { foodType, region } = req.query;
    let query = 'restaurants+in+Portugal';
    
    if (foodType) {
      query += `+${foodType}`;
    }
    if (region) {
      query += `+${region}`;
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

    const response = await axios.get(url);
    const places = response.data.results;

    const formattedPlaces = places.map(place => ({
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating,
      photos: place.photos?.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`) || [],
      foodType: place.types.find(type => type.includes('restaurant') || type.includes('food')) || 'outro',
      region: place.plus_code ? place.plus_code.compound_code.split(' ')[1] : 'Portugal' // Exemplo para pegar a região do plus code
    }));

    res.status(200).json({ places: formattedPlaces });
  } catch (error) {
    console.error('Error fetching places to eat:', error);
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

app.get('/place-details', async (req, res) => {
  const { place_id } = req.query;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!place_id) {
    return res.status(400).json({ error: 'place_id is required' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,price_level,user_ratings_total,geometry.location&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data.status === 'OK') {
      res.json(data.result);
    } else {
      console.error('Error fetching place details:', data);
      res.status(500).json({ error: data.status, message: data.error_message });
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/place-stats', async (req, res) => {
  const { city, type } = req.query; // Obtém cidade e tipo dos parâmetros de consulta
  const apiKey = process.env.GOOGLE_API_KEY;

  // Verifica se os parâmetros city e type foram fornecidos
  if (!city || !type) {
    return res.status(400).json({ error: 'city and type are required' });
  }

  // URL da API do Google Places para buscar lugares por cidade e tipo
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${type}+in+${city}&key=${apiKey}`;

  try {
    const response = await axios.get(url); // Faz a requisição para a API do Google Places
    const data = response.data; // Converte a resposta em JSON
    if (data.status !== 'OK') {
      console.error('Error from Google Places API:', data);
      return res.status(500).json({ error: data.status, message: data.error_message });
    }

    // Filtra os lugares para considerar apenas aqueles com mais de 100 avaliações
    const places = data.results.filter(place => place.user_ratings_total > 100);
    // Extrai as avaliações (ratings) dos lugares filtrados
    const ratings = places.map(place => place.rating).filter(rating => rating !== undefined);

    // Verifica se há avaliações suficientes para calcular as estatísticas
    if (ratings.length === 0) {
      return res.status(404).json({ error: 'No ratings found for the specified city and type with more than 100 reviews' });
    }

    // Calcula o total de avaliações
    const totalRatings = ratings.reduce((sum, rating) => sum + rating, 0);
    // Calcula a média das avaliações
    const averageRating = totalRatings / ratings.length;
    const marginOfError = 0.5; // Margem de erro fixa
    const minRating = Math.min(...ratings); // Obtém a menor avaliação
    const maxRating = Math.max(...ratings); // Obtém a maior avaliação

    // Cria um objeto com as estatísticas
    const stats = {
      averageRating: averageRating.toFixed(2), // Formata a média para 2 casas decimais
      marginOfError: marginOfError.toFixed(2), // Formata a margem de erro para 2 casas decimais
      minRating, // Pior avaliação
      maxRating // Melhor avaliação
    };

    res.json(stats); // Retorna as estatísticas como resposta
  } catch (error) {
    console.error('Error fetching place stats:', error);
    res.status(500).json({ error: error.message });
  }
});

const fetchPlaceCounts = async (type) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cities = ["Lisboa", "Sintra", "Vila Nova de Gaia", "Porto", "Cascais"];
  const results = {};

  for (const city of cities) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${type}+in+${city}&key=${apiKey}`;
    try {
      const response = await axios.get(url);
      const data = response.data;
      if (data.status === 'OK') {
        results[city] = data.results.length;
      } else {
        console.error(`Error from Google Places API for ${city}:`, data);
        results[city] = 0;
      }
    } catch (error) {
      console.error(`Error fetching places for ${city}:`, error);
      results[city] = 0;
    }
  }

  return results;
};

// Nova rota para obter a quantidade de locais por cidade
app.get('/place-counts', async (req, res) => {
  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ error: 'type is required' });
  }

  try {
    const counts = await fetchPlaceCounts(type);
    res.json(counts);
  } catch (error) {
    console.error('Error fetching place counts:', error);
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
