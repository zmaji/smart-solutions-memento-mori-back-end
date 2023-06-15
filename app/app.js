// Dependencies
const express = require('express');
const { RateLimiterMemory, RateLimiterQueue } = require('rate-limiter-flexible');
const bodyParser = require('body-parser');
const CronJob = require('cron').CronJob;
const cors = require('cors');

// Imported methods
const { readExcelFile } = require('./data/readExcel');
const { createClient } = require('./database/createClient');
const { compareAndUpdateData } = require('./database/compareAndUpdateData');
const { getPeople } = require('./database/getPeople');
const { getOrphan } = require('./database/getOrphan');
const { getAdult } = require('./database/getAdult');

// Variables
const excelFile = '../app/files/2023-StMM-Overzicht-Weezenkerkhof.xlsx'
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
app.use(cors({ origin: 'http://localhost:8080' }));

app.listen(3000, () => {
  console.log('Stichting Memento Mori back-end app listening on port 3000!');
});

app.get('/getPeople', async (req, res) => {
  try {
    const { category, search  } = req.query;
    const databaseClient = await createClient(user, host, database, password, port);
    const rows = await getPeople(databaseClient, '"Personen"', search, category);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while getting data.');
  }
});

// Sync the database and update or add rows
const syncDatabase = async () => {
  console.log('Starting the sync with the PostgreSQL database..')

  // Maximum amount of requests and add functionality to process queue after again after 10 seconds
  const limiter = new RateLimiterQueue(new RateLimiterMemory(APILimits));

  // Read all people from the Excel file
  const people = await readExcelFile(excelFile);

  // Create a client that connects the database to the application
  const databaseClient = await createClient(user, host, database, password, port);

  // Compare and update the database
  await compareAndUpdateData(people, tableName, databaseClient, limiter);
}

app.get('/sync', async (req, res) => {
  try {
    console.log('Visited the sync endpoint..');
    await syncDatabase();
    console.log('Database synchronization succeeded!');
    res.status(200).send('Database synchronization succeeded!');
  } catch (error) {
    console.error('Database synchronization failed:', error);
    res.status(500).send('Database synchronization failed!');
  }
});

const compareOverlijden = (a, b) => {
  const overlijdenA = a.datum_overlijden;
  const overlijdenB = b.datum_overlijden;

  if (overlijdenA === null || overlijdenB === null) {
    if (overlijdenA === null && overlijdenB !== null) {
      return 1;
    } else if (overlijdenA !== null && overlijdenB === null) {
      return -1;
    } else {
      return 0;
    }
  }

  const [dayA, monthA, yearA] = overlijdenA.split('/').map(Number);
  const [dayB, monthB, yearB] = overlijdenB.split('/').map(Number);

  if (yearA !== yearB) {
    return yearA - yearB; 
  }
  if (monthA !== monthB) {
    return monthA - monthB; 
  }
  return dayA - dayB; 
};

// COMMENTED SECTION AGAINST ABUSING THE ENDPOINT WITHOUT VALID AUTHORIZATION

// app.get('/weeskinderen', async (req, res) => {
//   console.log('Visited the weeskinderen endpoint..');
//   try {
//     const databaseClient = await createClient(user, host, database, password, port);
//     const rowsByCellValue = await getOrphan(databaseClient, '"Personen"');
//     const data = {
//       AlleWeeskinderen: Object.entries(rowsByCellValue).reduce((acc, [value, rows]) => {
//         const valueWithLength = `${value} (${rows.length} kinderen)`;
//         const sortedRows = rows
//           .map(({ voornamen, tussenvoegsel, achternaam, roepnaam, geslacht, bijzonderheden, reden_overlijden, grave_id, zichtbaar_graf, soort_graf, pupil, geboortedatum, datum_overlijden, leeftijd_tijdens_overlijden, datum_begraven }) => ({
//             voornamen,
//             tussenvoegsel,
//             achternaam,
//             roepnaam,
//             geslacht,
//             bijzonderheden,
//             reden_overlijden,
//             grave_id,
//             zichtbaar_graf,
//             soort_graf,
//             pupil,
//             geboortedatum,
//             datum_overlijden,
//             leeftijd_tijdens_overlijden,
//             datum_begraven
//           }))
//           .sort(compareOverlijden);
//         acc[valueWithLength] = sortedRows;
//         return acc;
//       }, {})
//     };
//     res.json(data);
//     console.log('Orphans successfully retrieved');
//   } catch (error) {
//     console.error('Something went wrong retrieving orphans:', error);
//     res.status(500).send('Something went wrong retrieving orphans!');
//   }
// });

// app.get('/volwassenen', async (req, res) => {
//   console.log('Visited the volwassenen endpoint..');
//   try {
//     const databaseClient = await createClient(user, host, database, password, port);
//     const adults = await getAdult(databaseClient, '"Personen"');
//     adults.sort(compareOverlijden);
//     const data = {
//       Volwassenen: adults.map(row => ({
//         // naam: `${row.voornamen} ${row.tussenvoegsel ? row.tussenvoegsel + ' ' : ''}${row.achternaam}`,
//         redenOverijden: `${row.reden_overlijden}`,
//       }))
//     };

//     const count = data.Volwassenen.length; // Count the number of adults

//     res.json({ count, data }); // Include the count in the response

//     console.log('Adults successfully retrieved');
//   } catch (error) {
//     console.error('Something went wrong retrieving adults:', error);
//     res.status(500).send('Something went wrong retrieving adults!');
//   }
// });

// CronJob runs every first day of the month at 00.00 CET
const jobCron = new CronJob('0 0 1 * *', () => {
  console.log('Executing the monthly ');
  syncDatabase();
}, {
  timeZone: 'Europe/Amsterdam',
});

jobCron.start();

