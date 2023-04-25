const { createClient } = require('/createClient');
const { compareAndUpdateData } = require('/compareData');
const { getAllRows } = require('/getAllRows');
const { getPeople } = require('/getPeople');

module.exports = { 
  createClient,
  compareAndUpdateData,
  getAllRows,
  getPeople
}