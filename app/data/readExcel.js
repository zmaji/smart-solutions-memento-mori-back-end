const xlsx = require('xlsx');

// const readExcelFile = async(excelFile) => {
//   return new Promise((resolve, reject) => {
//     console.log('Reading Excel file..');
//     const workbook = xlsx.readFile(excelFile);
//     const sheetNames = workbook.SheetNames;
//     const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

//     if (excelData) {
//       console.log('Successfully read Excel file!');
//       console.log(`Retrieved Excel data: ${excelData}`);
//       resolve(excelData);
//     } else {
//       reject(new Error('No data found in Excel file'));
//     }
//   });
// }

const readExcelFile = async (excelFile) => {
  return new Promise((resolve, reject) => {
    console.log('Reading Excel file..');
    const workbook = xlsx.readFile(excelFile);
    const sheetNames = workbook.SheetNames;
    const worksheet = workbook.Sheets[sheetNames[0]];
    const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

    // Define the row numbers to skip
    const rowsToSkip = [1, 74, 490, 494];

    // Remove the specified rows from the data
    const filteredData = excelData.filter((_, rowIndex) => !rowsToSkip.includes(rowIndex + 1));

    if (filteredData) {
      console.log('Successfully read Excel file!');
      console.log(`Retrieved Excel data: ${filteredData}`);
      resolve(filteredData);
    } else {
      reject(new Error('No data found in Excel file'));
    }
  });
};

module.exports = {
  readExcelFile
};
