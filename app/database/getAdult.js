async function getAdult(client, tableName) {
  const columnName = 'Pupil';
  let queryText = `SELECT * FROM ${tableName} WHERE rol = '${columnName}' AND functie IS NULL AND grave_id ILIKE '%onbekend%'`;

  const query = {
    text: queryText,
  };

  console.log(`QUERY TEXT:`);
  console.log(query);

  const result = await client.query(query);
  const rows = result.rows;

  await client.end();

  return rows;
}

module.exports = {
  getAdult
}
