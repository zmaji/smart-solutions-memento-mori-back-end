async function getPeople(client, tableName, searchText, categories) {
  let queryText = `SELECT * FROM ${tableName}`;

  if (searchText) {
    queryText += ` WHERE roepnaam LIKE '%${searchText}%'`;
  }
  
  if (categories) {
    if (typeof categories === 'string') {
      queryText += `${searchText ? ' AND' : ' WHERE'} rol LIKE '${categories}'`;
    } else if (Array.isArray(categories) && categories.length > 1) {
      const categoryList = categories.join("', '");
      queryText += `${searchText ? ' AND' : ' WHERE'} rol IN ('${categoryList}')`;
    }
  }

  const query = {
    text: queryText,
  };

  console.log(`QUERY TEXT:`);
  console.log(query);

  const result = await client.query(query);
  return result.rows;
}

module.exports = {
  getPeople
}