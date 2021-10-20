const express = require('express');
const axios = require('axios');
const redis = require('redis');
const responseTime = require('response-time');
const { promisify } = require('util');

// redis client
const client = redis.createClient();

// Create the express app
const app = express();

// Add response time header
app.use(responseTime());

// Get all characters
app.get('/character', async (req, res) => {
  // redis callbacks

  // Get the characters from the cache
  client.get('characters', async (err, reply) => {
    if (reply) {
      return res.json(JSON.parse(reply));
    } else {
      const response = await axios.get(
        'https://rickandmortyapi.com/api/character'
      );

      client.set('characters', JSON.stringify(response.data.results), (err, reply) => {
        if (err) {
          console.log(err);
        }
        console.log(reply);

        // resond to client
        return res.json(response.data);
      });
    }
  })

});

app.get('/character/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Fetching Data from Rick and Morty API
    const response = await axios.get(
      `https://rickandmortyapi.com/api/character/${id}`
    );

    // resond to client
    res.json(response.data);
  } catch (error) {
    res.send(error.message);
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
