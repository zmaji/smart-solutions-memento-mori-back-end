const { Client } = require('pg');

const createClient = async(user, host, database, password, port) => {
  return new Promise((resolve, reject) => {
    console.log(`Connecting to the PostgreSQL database..`)
    const client = new Client({
      user: user,
      host: host,
      database: database,
      password: password,
      port: port,
    });

    if (client) {
      console.log('Connected to PostgreSQL database');
      client.connect();
      resolve(client);
    } else {
      reject(new Error(`Error connecting to the PostgreSQL database`));
    }
  });
}

module.exports = {
  createClient
}