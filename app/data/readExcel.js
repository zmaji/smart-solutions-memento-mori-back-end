const xlsx = require('xlsx');

async function readExcelFile(fileLocation) {
  try {
    console.log(`Reading Excel file`);
    const workbook = xlsx.readFile(fileLocation);
    const sheetNames = workbook.SheetNames;
    const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    return excelData;
  } catch (error) {
    console.log(`Failed to read Excel file`);
    console.error(error);
  }
}

module.exports = {
  readExcelFile
}