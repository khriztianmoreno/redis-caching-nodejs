const express = require('express');
const axios = require('axios');
const redis = require('redis');
const responseTime = require('response-time');
const {
  promisify
} = require('util');

// Create the express app
const app = express();

// redis client
const client = redis.createClient();

// Promisifying Get and set methods
const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.set).bind(client);

// Add response time header
app.use(responseTime());

// Get all characters
app.get('/characters', async (req, res) => {
  try {
    // Search Data in Redis
    const reply = await GET_ASYNC('characters');

    // if exists returns from redis and finish with response
    if (reply) return res.send(JSON.parse(reply));

    // Fetching Data from Rick and Morty API
    const response = await axios.get(
      'https://rickandmortyapi.com/api/character'
    );

    // Saving the results in Redis. The 'EX' and 10, sets an expiration of 10 Seconds
    const saveResult = await SET_ASYNC(
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
  const {
    id
  } = req.params;
  try {
    const reply = await GET_ASYNC(req.originalUrl);

    if (reply) {
      console.log('using cached data');
      return res.send(JSON.parse(reply));
    }

    const response = await axios.get(
      `https://rickandmortyapi.com/api/character/${id}`
    );
    const saveResult = await SET_ASYNC(
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
      response: {
        status
      }
    } = error
    console.log(error);
    res.status(status).json(message);
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
