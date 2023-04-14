const xlsx = require('xlsx');

const readExcelFile = async(excelFile) => {
  return new Promise((resolve, reject) => {
    console.log('Reading Excel file..');
    const workbook = xlsx.readFile(excelFile);
    const sheetNames = workbook.SheetNames;
    const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

    if (excelData) {
      console.log('Successfully read Excel file!');
      console.log(`Retrieved Excel data: ${excelData}`);
      resolve(excelData);
    } else {
      reject(new Error('No data found in Excel file'));
    }
  });
}

module.exports = {
  readExcelFile
}