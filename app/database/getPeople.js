async function getPeople(client, tableName, searchText, categories) {
  let queryText = `SELECT * FROM ${tableName}`;

  if (searchText) {
    queryText += `
    WHERE roepnaam ILIKE '%${searchText}%'
    OR voornamen ILIKE '%${searchText}%'
    OR achternaam ILIKE '%${searchText}%'
    OR geboorteplaats ILIKE '%${searchText}%'
    OR provincie ILIKE '%${searchText}%'
    OR rol ILIKE '%${searchText}%'
    OR functie ILIKE '%${searchText}%'
    OR grave_id ILIKE '%${searchText}%'
    OR locatie ILIKE '%${searchText}%'
    OR voorheen_pupil ILIKE '%${searchText}%'
    OR vader ILIKE '%${searchText}%'
    OR moeder ILIKE '%${searchText}%'
    OR opleiding ILIKE '%${searchText}%'
    OR gehuwd_met ILIKE '%${searchText}%'
    `;
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
  
  await client.end(); // Close the client after retrieving the people
  
  return result.rows;
}

module.exports = {
  getPeople
}
