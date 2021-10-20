const express = require('express');
const axios = require('axios');
const redis = require('redis');
const responseTime = require('response-time');
const { promisify } = require('util');

const app = express();

// Add response time header
app.use(responseTime());

// Get all characters
app.get('/character', async (req, res) => {
  try {
    // Fetching Data from Rick and Morty API
    const response = await axios.get(
      'https://rickandmortyapi.com/api/character'
    );

    // resond to client
    res.json(response.data);
  } catch (error) {
    res.send(error.message);
  }
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
