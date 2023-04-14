const { v4: uuidv4 } = require('uuid');

async function formatDate(date) {
  console.log(`TYPE OF: typeof ${date}`);
  const dateParts = date.split('-'); // Split the string into year, month, and day parts
  const dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // Create a Date object from the parts (note that month is zero-indexed)
  const outputDate = dateObject.toLocaleDateString('en-GB'); // Format the Date object into a string with dd-mm-yyyy format
  return outputDate;
}

async function compareAndUpdateData(excelData, tableName, client, limiter) {
  console.log(`Comparing data with database..`);
    for (const excelRow of excelData) {
      // Log the remaining tokens and limit the requests
      const remainingTokens = await limiter.removeTokens(1)
      console.log('Remaining tokens:' , remainingTokens)

      // Select all data from the tablename with a matching 'grafnummer'
      const selectQuery = {
        text: `SELECT * FROM "${tableName}" WHERE grave_id = $1`,
        values: [excelRow.Grafnummer]
      };
      const results = await client.query(selectQuery);

      // If a matching row is found, update it
      if (results.rows.length > 0) {
        console.log(`Matching row with id ${excelRow.Grafnummer} found in ${tableName}!`);
        console.log(`Looking for values to be updated in row with id ${excelRow.Grafnummer} in ${tableName}`);
        
        const updateQuery = {
          text: `UPDATE ${tableName} SET 
          achternaam = $1 WHERE achternaam <> $1,
          tussenvoegsel = $2 WHERE tussenvoegsel <> $2,
          voornamen = $3 WHERE voornamen <> $3,
          roepnaam = $4 WHERE roepnaam <> $4,
          geslacht = $5 WHERE geslacht <> $5,
          geboorteplaats = $6 WHERE geboorteplaats <> $6,
          provincie = $7 WHERE provincie <> $7,
          geboortedatum = $8 WHERE geboortedatum <> $8,
          datum_overlijden = $9 WHERE datum_overlijden <> $9,
          leeftijd_tijdens_overlijden = $10 WHERE leeftijd_tijdens_overlijden <> $10,
          datum_begraven = $11 WHERE datum_begraven <> $11,
          rol = $12 WHERE rol <> $12,
          functie = $13 WHERE functie <> $13,
          pupil_vanaf = $14 WHERE pupil_vanaf <> $14,
          pupil_tot = $15 WHERE pupil_tot <> $15,
          bijzonderheden = $16 WHERE bijzonderheden <> $16,
          reden_overlijden = $17 WHERE reden_overlijden <> $17`,
          values: [excelRow.Achternaam, excelRow.Tussenvoegsel, excelRow.Voornamen, excelRow.Roepnaam, excelRow.Sexe, excelRow.Geboorteplaats, excelRow.Provincie, excelRow.Geboortedatum, excelRow.Overlijden, excelRow.Leeftijd, excelRow.Begraven, excelRow.RolNeerbosch, excelRow.Functie, excelRow.VoorheenPupil, excelRow.VoorheenPupil, excelRow.Bijzonderheden, excelRow.RedenOverlijden]
        };
        await client.query(updateQuery);
        console.log(`Successfully updated row with id ${excelRow.Grafnummer} in ${tableName}!`);
      } else {
        // If no matching row is found, insert a new row
        console.log(`No matching row with id ${excelRow.Grafnummer} found in ${tableName}!`);
        console.log(`Inserting row with id ${excelRow.Grafnummer}..`);
        const uuid = uuidv4();
        // const formatteBirthDate = formatDate(excelRow.Geboortedatum);
        // const formattedDeathDate = formatDate(excelRow.Overlijden);

        // let pupilDate = excelRow.VoorheenPupil;

        // if (excelRow.VoorheenPupil != '') {
        //   pupilDate = formatDate(excelRow.VoorheenPupil);
        // } 
        
        const insertQuery = {
          text: `INSERT INTO "${tableName}" (person_id, grave_id, achternaam, tussenvoegsel, voornamen, roepnaam, geslacht, geboorteplaats, provincie, geboortedatum, datum_overlijden, leeftijd_tijdens_overlijden, datum_begraven, rol, functie, pupil_vanaf, pupil_tot, bijzonderheden, reden_overlijden) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
          values: [uuid, excelRow.Grafnummer, excelRow.Achternaam, excelRow.Tussenvoegsel, excelRow.Voornamen, excelRow.Roepnaam, excelRow.Sexe, excelRow.Geboorteplaats, excelRow.Provincie, excelRow.Geboortedatum, excelRow.Overlijden, excelRow.Leeftijd, excelRow.Begraven, excelRow.RolNeerbosch, excelRow.Functie, excelRow.VoorheenPupil, excelRow.VoorheenPupil, excelRow.Bijzonderheden, excelRow.RedenOverlijden]
        };
        await client.query(insertQuery);
        console.log(`Successfully inserted new row with id ${excelRow.Grafnummer} into ${tableName}`);
      }
    }
  console.log(`Closing database connection..`);
  await client.end();
}

module.exports = {
  compareAndUpdateData
}