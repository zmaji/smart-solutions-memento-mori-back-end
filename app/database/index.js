const { createClient } = require('/createClient');
const { compareAndUpdateData } = require('/compareData');
const { getAllRows } = require('/getAllRows');
const { getPeople } = require('/getPeople');
const { getOrphan } = require('/getOrphan');

module.exports = { 
  createClient,
  compareAndUpdateData,
  getAllRows,
  getPeople,
  getOrphan
}