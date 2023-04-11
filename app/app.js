const express = require('express');
const { readExcelFile } = require('./data/readExcel');
const { RateLimiterMemory, RateLimiterQueue } = require('rate-limiter-flexible');

const app = express();

const fileLocation = '../app/files/2021-StMM-Overzicht-Weezenkerkhof.xlsx'

app.get('/', (req, res) => {
  const excelData = readExcelFile(fileLocation);
  console.log(excelData);
  res.send('HALLO DIT IS EEN WEBAPPLICATIE!!!!');
  res.send(`DATA: ${excelData}`);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

const APILimits = {
  points: 100, // Requests
  duration: 10, // Seconds
}

const syncDatabase = async () => {
  console.log('Starting the sync with the PostgreSQL database..')

  // Maximum amount of requests
  const rateLimiter = new RateLimiterMemory(APILimits);

  // Add functionality to process queue after again after 10 seconds
  const limiter = new RateLimiterQueue(rateLimiter);

  // const accessToken = await getAccessToken();

  // if (accessToken) {
  //   // Get all jobs from Processionals
  //   const jobs = await getJobs(accessToken, baseUrl, limiter);

  //   if (jobs && jobs.length) {
  //     // Get all rows from HubDB
  //     let rows = await getAllRows(hubdb, hubToken, limiter);

  //     if (rows.length) {

  //       // Manually update NVB
  //       // for (const row of rows) {
  //       //   if (row.values.nvb_id) {
  //       //     updateVacancy(row);
  //       //   }
  //       // }

  //       const duplicatesToDelete = await getDuplicates(rows, jobs);

  //       console.log(duplicatesToDelete);
  //       if (duplicatesToDelete.length) {
  //         console.log(`We need to delete ${duplicatesToDelete.length} duplicate rows`)
  //         await deleteRows(hubdb, duplicatesToDelete, hubToken, limiter);
  //         await publishHubDB(hubdb, hubToken, limiter);
  //         rows = await getAllRows(hubdb, hubToken, limiter);
  //       }

  //       const rowsToCRUD = await compareData(rows, jobs);

  //       if (rowsToCRUD) {
  //         console.log(`We need to create ${rowsToCRUD.rowsToCreate.length} row(s), update ${rowsToCRUD.rowsToUpdate.length} row(s) and remove ${rowsToCRUD.rowsToDelete.length} row(s)`);
  //         await addRows(hubdb, rowsToCRUD.rowsToCreate, hubToken, limiter);
  //         await updateRows(hubdb, rowsToCRUD.rowsToUpdate, hubToken, limiter);
  //         await deleteRows(hubdb, rowsToCRUD.rowsToDelete, hubToken, limiter);
  //       }
  //     } else {
  //       console.log(`We need to create ${jobs.length} row(s)`);
  //       await addRows(hubdb, jobs, hubToken, limiter);
  //     }
  //   } else {
  //     console.log(`Processionals currently has no jobs published.`);
  //     console.log(`Deleting all existing HubDB entries..`);
  //     let rows = await getAllRows(hubdb, hubToken, limiter);
  //     await deleteRows(hubdb, rows, hubToken, limiter);
  //     // await deleteAllVacancies(rows);
  //   }
  // }
  // // Need to publish table after CRUD
  // await publishHubDB(hubdb, hubToken, limiter);
  return true
}

// CronJob runs every first day of the month at 00.00 CET
const jobCron = new CronJob({
  cronTime: '0 0 1 * *',
  runOnInit: false,
  onTick: () => {
    syncDatabase.log('This cronjob will run every month');
    syncHubDB();
  },
  start: false,
  timeZone: 'Europe/Amsterdam'
})

jobCron.start();