async function getOrphan(client, tableName) {
  const columnName = 'pupil';
  let queryText = `SELECT * FROM ${tableName} WHERE rol = '${columnName}' AND grave_id LIKE '%onbekend%'`;

  const query = {
    text: queryText,
  };

  console.log(`QUERY TEXT:`);
  console.log(query);

  const result = await client.query(query);
  const cellValues = result.rows.map(row => row[columnName]);

  const rowsByCellValue = {};

  for (const value of cellValues) {
    const queryText = `SELECT * FROM ${tableName} WHERE ${columnName} = '${value}' AND rol = 'pupil' AND grave_id LIKE '%onbekend%'`;
    const query = {
      text: queryText,
    };
    const result = await client.query(query);
    rowsByCellValue[value] = result.rows;
  }

  await client.end();

  return rowsByCellValue;
}

module.exports = {
  getOrphan
}
