const xlsx = require('xlsx');
const { promisify } = require('util');

const readExcelFile = async (excelFile) => {
  console.log('Reading Excel file..');
  const workbook = await promisify(xlsx.readFile)(excelFile);
  const sheetNames = workbook.SheetNames;
  const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

  if (excelData) {
    console.log('Successfully read Excel file!');
    console.log(`Retrieved Excel data: ${excelData}`);
    return excelData;
  } else {
    throw new Error('No data found in Excel file');
  }
};

module.exports = {
  readExcelFile
};
