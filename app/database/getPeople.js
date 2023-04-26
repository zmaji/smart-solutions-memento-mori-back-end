// async function getPeople(client, tableName, params) {
//   if (params) {
//     console.log(`Getting all people with params ${params}..`);
//   } else {
//     console.log(`Getting all people..`);
//   }  

//   const selectQuery = {
//     text: `SELECT * FROM "${tableName}"`,
//   };

//   const results = await client.query(selectQuery);
//   console.log(`Results : ${results.rows}`);
//   return results
// }

async function getPeople(client, tableName, params) {
  if (params) {
    console.log(`Getting all people with params ${params}..`);
  } else {
    console.log(`Getting all people..`);
  }  

  const query = {
    text: `SELECT * FROM ${tableName}`,
  };

  const result = await client.query(query);
  console.log(result.rows);
  return result.rows;
}

module.exports = {
  getPeople
}