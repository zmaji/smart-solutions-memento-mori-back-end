const { v4: uuidv4 } = require('uuid');

async function compareAndUpdateData(excelData, tableName, client, limiter) {
  console.log(`Comparing data with database..`);
    for (const excelRow of excelData) {

      // Log the remaining tokens and limit the requests
      const remainingTokens = await limiter.removeTokens(1)
      console.log('Remaining tokens:' , remainingTokens)

      const grafnummer = excelRow.Grafnummer.toString();

      // Select all data from the tablename with a matching 'grafnummer'
      const selectQuery = {
        text: `SELECT * FROM "${tableName}" WHERE grave_id = $1`,
        values: [grafnummer]
      };
      const results = await client.query(selectQuery);

      // If a matching row is found, update it
      if (results.rows.length > 0) {
        console.log(`Matching row with grafnummer ${excelRow.Grafnummer} found in ${tableName}!`);
        console.log(excelRow);
        console.log(`Looking for values to be updated in row with grafnummer ${excelRow.Grafnummer} in ${tableName}`);

        const updateQuery = {
          text: `
          UPDATE "${tableName}"
          SET 
          achternaam = CASE WHEN achternaam <> $1 THEN $1 ELSE achternaam END,
          tussenvoegsel = CASE WHEN tussenvoegsel <> $2 THEN $2 ELSE tussenvoegsel END,
          voornamen = CASE WHEN voornamen <> $3 THEN $3 ELSE voornamen END,
          roepnaam = CASE WHEN roepnaam <> $4 THEN $4 ELSE roepnaam END,
          geslacht = CASE WHEN geslacht <> $5 THEN $5 ELSE geslacht END,
          geboorteplaats = CASE WHEN geboorteplaats <> $6 THEN $6 ELSE geboorteplaats END,
          provincie = CASE WHEN provincie <> $7 THEN $7 ELSE provincie END,
          geboortedatum = CASE WHEN geboortedatum <> $8 THEN $8 ELSE geboortedatum END,
          datum_overlijden = CASE WHEN datum_overlijden <> $9 THEN $9 ELSE datum_overlijden END,
          leeftijd_tijdens_overlijden = CASE WHEN leeftijd_tijdens_overlijden <> $10 THEN $10 ELSE leeftijd_tijdens_overlijden END,
          datum_begraven = CASE WHEN datum_begraven <> $11 THEN $11 ELSE datum_begraven END,
          rol = CASE WHEN rol <> $12 THEN $12 ELSE rol END,
          functie = CASE WHEN functie <> $13 THEN $13 ELSE functie END,
          pupil_vanaf = CASE WHEN pupil_vanaf <> $14 THEN $14 ELSE pupil_vanaf END,
          pupil_tot = CASE WHEN pupil_tot <> $15 THEN $15 ELSE pupil_tot END,
          bijzonderheden = CASE WHEN bijzonderheden <> $16 THEN $16 ELSE bijzonderheden END,
          reden_overlijden = CASE WHEN reden_overlijden <> $17 THEN $17 ELSE reden_overlijden END
          WHERE grave_id = '${18}';`,
          values: [
            excelRow.Achternaam, excelRow.Tussenvoegsel, excelRow.Voornamen, excelRow.Roepnaam, excelRow.Sexe, excelRow.Geboorteplaats, excelRow.Provincie, excelRow.Geboortedatum, excelRow.Overlijden, excelRow.Leeftijd, excelRow.Begraven, excelRow.RolNeerbosch, excelRow.Functie, excelRow.VoorheenPupil, excelRow.VoorheenPupil, excelRow.Bijzonderheden, excelRow.RedenOverlijden
          ]
        };

        await client.query(updateQuery);
        console.log(`Successfully updated row with grafnummer ${excelRow.Grafnummer} in ${tableName}!`);
      } else {
        // If no matching row is found, insert a new row
        console.log(`No matching row with grafnummer ${excelRow.Grafnummer} found in ${tableName}!`);
        console.log(`Inserting row with grafnummer ${excelRow.Grafnummer}..`);
        const uuid = uuidv4();
        
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