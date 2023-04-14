const { createClient } = require('/createClient');
const { compareData } = require('/compareData');
const { getAllRows } = require('/getAllRows');

module.exports = { 
  createClient,
  compareAndUpdateData,
  getAllRows
}