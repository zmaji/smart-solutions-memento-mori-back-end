// Dependencies
const express = require('express');
const { RateLimiterMemory, RateLimiterQueue } = require('rate-limiter-flexible');
const bodyParser = require('body-parser');
const CronJob = require('cron').CronJob;

// Imported methods
const { readExcelFile } = require('./data/readExcel');
const { createClient } = require('./database/createClient');
const { compareAndUpdateData } = require('./database/compareAndUpdateData');

// Variables
const excelFile = '../app/files/2021-StMM-Overzicht-Weezenkerkhof.xlsx'
const user = 'postgres';
const host = 'localhost';
const database = 'StichtingMementoMori';
const password = '79*ezCBin4XU';
const port = '5432';
const tableName = 'Personen'

const APILimits = {
  points: 100, // Requests
  duration: 10, // Seconds
}

// Creating an app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log('Stichting Memento Mori back-end app listening on port 3000!');
});

app.get('/', (req, res) => {
  syncDatabase();
});

// Sync the database and update or add rows
const syncDatabase = async () => {
  console.log('Starting the sync with the PostgreSQL database..')

  // Maximum amount of requests
  const rateLimiter = new RateLimiterMemory(APILimits);

  // Add functionality to process queue after again after 10 seconds
  const limiter = new RateLimiterQueue(rateLimiter);

  // Read all people from the Excel file
  const people = await readExcelFile(excelFile);

  // Create a client that connects the database to the application
  const databaseClient = await createClient(user, host, database, password, port);

  // Get all rows of the 'Personen' table based on the client
  if (databaseClient && people && people.length) {

    // Compare and update the database
    await compareAndUpdateData(people, tableName, databaseClient, limiter);
  }
}

// CronJob runs every first day of the month at 00.00 CET
const jobCron = new CronJob({
  cronTime: '0 0 1 * *',
  runOnInit: false,
  onTick: () => {
    console.log('This cronjob will run every month');
    syncDatabase();
  },
  start: false,
  timeZone: 'Europe/Amsterdam'
})

jobCron.start();