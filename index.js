const express = require('express');
const axios = require('axios');
const responseTime = require('response-time');

const RedisService = require('./redis-service');

// Create the express app
const app = express();

// redis client
const client = new RedisService();

// Add response time header
app.use(responseTime());

// Get all characters
app.get('/characters', async (req, res) => {
  try {
    // Search Data in Redis
    const reply = await client.get('characters');

    // if exists returns from redis and finish with response
    if (reply) return res.send(JSON.parse(reply));

    // Fetching Data from Rick and Morty API
    const response = await axios.get(
      'https://rickandmortyapi.com/api/character'
    );

    // Saving the results in Redis. The 'EX' and 10, sets an expiration of 10 Seconds
    const saveResult = await client.set(
      'characters',
      JSON.stringify(response.data),
      'EX',
      10
    );

    // resond to client
    res.json(response.data);
  } catch (error) {
    res.send(error.message);
  }
});

app.get('/characters/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const reply = await client.get(req.originalUrl);

    if (reply) {
      console.log('using cached data');
      return res.send(JSON.parse(reply));
    }

    const response = await axios.get(
      `https://rickandmortyapi.com/api/character/${id}`
    );
    const saveResult = await client.set(
      req.originalUrl,
      JSON.stringify(response.data),
      'EX',
      15
    );

    console.log('saved data:', saveResult);

    res.json(response.data);
  } catch (error) {
    const {
      message,
      response: { status },
    } = error;
    console.log(error);
    res.status(status).json(message);
  }
});

app.listen(process.env.PORT, () => {
  console.log('Listening on port 3000');
});
