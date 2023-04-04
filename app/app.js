const express = require('express');
const xlsx = require('xlsx');

const app = express();

app.get('/', (req, res) => {
  // Read Excel file
  const workbook = xlsx.readFile('C:\Users\Maurice\Desktop\SSS-dev\webapplication-stichting-memento-mori\app\files\2021-StMM-Overzicht-Weezenkerkhof.xlsx');
  const sheetNames = workbook.SheetNames;
  const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
  console.log(excelData);
  res.send('HALLO DIT IS EEN WEBAPPLICATIE!!!!');
  res.send(`DATA: ${excelData}`);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});