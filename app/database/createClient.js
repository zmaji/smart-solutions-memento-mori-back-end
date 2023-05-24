const { Client } = require('pg');

const createClient = async (user, host, database, password, port) => {
  console.log('Connecting to the PostgreSQL database..');
  const client = new Client({
    user,
    host,
    database,
    password,
    port,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    return client;
  } catch (error) {
    console.error('Error connecting to the PostgreSQL database:', error);
    throw error;
  }
};

module.exports = {
  createClient,
};
