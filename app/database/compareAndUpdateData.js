const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

async function compareAndUpdateData(excelData, tableName, client, limiter) {
  console.log(`Comparing data with database..`);
      for (const excelRow of excelData) {

      // Log the remaining tokens and limit the requests
      const remainingTokens = await limiter.removeTokens(1)
      console.log('Remaining tokens:' , remainingTokens)

      const columnReference = excelRow.Grafnummer.toString();
      const columnQuery = `grave_id`;

      // Select all data from the tablename with a matching 'grafnummer'
      const selectQuery = {
        text: `SELECT * FROM "${tableName}" WHERE ${columnQuery} = $1`,
        values: [columnReference]
      };
      const results = await client.query(selectQuery);

      // If a matching row is found, update it
      if (results.rows.length > 0) {
        console.log(`Matching row with search reference ${columnReference} found in ${tableName}!`);
        console.log(excelRow);
        console.log(`Looking for values to be updated in row with search reference ${columnReference} in ${tableName}`);

        const updateQuery = {
          text: `
            UPDATE "${tableName}"
            SET 
            zichtbaar_graf = CASE WHEN $1::text IS NULL THEN NULL ELSE COALESCE($1::text, zichtbaar_graf) END,
            piketnummer = CASE WHEN $2::integer IS NULL THEN NULL ELSE COALESCE($2::integer, piketnummer) END,
            rol = CASE WHEN $3::text IS NULL THEN NULL ELSE COALESCE($3::text, rol) END,
            achternaam = CASE WHEN $4::text IS NULL THEN NULL ELSE COALESCE($4::text, achternaam) END,
            tussenvoegsel = CASE WHEN $5::text IS NULL THEN NULL ELSE COALESCE($5::text, tussenvoegsel) END,
            voornamen = CASE WHEN $6::text IS NULL THEN NULL ELSE COALESCE($6::text, voornamen) END,
            roepnaam = CASE WHEN $7::text IS NULL THEN NULL ELSE COALESCE($7::text, roepnaam) END,
            periode_geleefd = CASE WHEN $8::text IS NULL THEN NULL ELSE COALESCE($8::text, periode_geleefd) END,
            geboortedatum = CASE WHEN $9::text IS NULL THEN NULL ELSE COALESCE($9::text, geboortedatum) END,
            geboorteplaats = CASE WHEN $10::text IS NULL THEN NULL ELSE COALESCE($10::text, geboorteplaats) END,
            provincie = CASE WHEN $11::text IS NULL THEN NULL ELSE COALESCE($11::text, provincie) END,
            vader = CASE WHEN $12::text IS NULL THEN NULL ELSE COALESCE($12::text, vader) END,
            moeder = CASE WHEN $13::text IS NULL THEN NULL ELSE COALESCE($13::text, moeder) END,
            gehuwd_met = CASE WHEN $14::text IS NULL THEN NULL ELSE COALESCE($14::text, gehuwd_met) END,
            datum_huwelijk = CASE WHEN $15::date IS NULL THEN NULL ELSE COALESCE($15::date, datum_huwelijk) END,
            plaats_huwelijk = CASE WHEN $16::text IS NULL THEN NULL ELSE COALESCE($16::text, plaats_huwelijk) END,
            datum_overlijden = CASE WHEN $17::date IS NULL THEN NULL ELSE COALESCE($17::date, datum_overlijden) END,
            leeftijd_tijdens_overlijden = CASE WHEN $18::text IS NULL THEN NULL ELSE COALESCE($18::text, leeftijd_tijdens_overlijden) END,
            reden_overlijden = CASE WHEN $19::text IS NULL THEN NULL ELSE COALESCE($19::text, reden_overlijden) END,
            datum_begraven = CASE WHEN $20::date IS NULL THEN NULL ELSE COALESCE($20::date, datum_begraven) END,
            urn = CASE WHEN $21::date IS NULL THEN NULL ELSE COALESCE($21::date, urn) END,
            uitstrooien = CASE WHEN $22::date IS NULL THEN NULL ELSE COALESCE($22::date, uitstrooien) END,
            locatie = CASE WHEN $23::text IS NULL THEN NULL ELSE COALESCE($23::text, locatie) END,
            soort_graf = CASE WHEN $24::text IS NULL THEN NULL ELSE COALESCE($24::text, soort_graf) END,
            aankomst_neerbosch = CASE WHEN $25::date IS NULL THEN NULL ELSE COALESCE($25::date, aankomst_neerbosch) END,
            verblijfsduur = CASE WHEN $26::text IS NULL THEN NULL ELSE COALESCE($26::text, verblijfsduur) END,
            opleiding = CASE WHEN $27::text IS NULL THEN NULL ELSE COALESCE($27::text, opleiding) END,
            geslacht = CASE WHEN $28::text IS NULL THEN NULL ELSE COALESCE($28::text, geslacht) END,
            pupil = CASE WHEN $29::text IS NULL THEN NULL ELSE COALESCE($29::text, pupil) END,
            functie = CASE WHEN $30::text IS NULL THEN NULL ELSE COALESCE($30::text, functie) END,
            voorheen_pupil = CASE WHEN $31::text IS NULL THEN NULL ELSE COALESCE($31::text, voorheen_pupil) END,
            bijzonderheden = CASE WHEN $32::text IS NULL THEN NULL ELSE COALESCE($32::text, bijzonderheden) END
            WHERE ${columnQuery} = $33;`,
          values: [
            excelRow.ZichtbaarGraf, excelRow.Piketnummer, excelRow.Rol, excelRow.Achternaam, excelRow.Tussenvoegsel, excelRow.Voornamen, excelRow.Roepnaam, 
            excelRow.Leefperiode, excelRow.Geboortedatum, excelRow.Geboorteplaats, excelRow.Provincie, excelRow.Vader, excelRow.Moeder, excelRow.GehuwdMet, 
            excelRow.DatumHuwelijk, excelRow.PlaatsHuwelijk, excelRow.Overlijden, excelRow.Leeftijd, excelRow.RedenOverlijden, excelRow.Begraven, excelRow.Urn, 
            excelRow.Uitstrooien, excelRow.Locatie, excelRow.SoortGraf, excelRow.AankomstNeerbosch, excelRow.Verblijfsduur, excelRow.Opleiding, excelRow.Sexe, 
            excelRow.Pupil, excelRow.Functie, excelRow.VoorheenPupil, excelRow.Bijzonderheden, columnReference
          ]
        };

        console.log(`UPDATE QUERY`);
        console.log(updateQuery);

        await client.query(updateQuery);
        console.log(`Successfully updated row with search reference ${columnReference} in ${tableName}!`);
      } else {
        // If no matching row is found, insert a new row
        console.log(`No matching row with search reference ${columnReference} found in ${tableName}!`);
        console.log(`Inserting row with search reference ${columnReference}..`);
        
        const uuid = uuidv4();
        
        const insertQuery = {
          text: `INSERT INTO "${tableName}" (person_id, voornamen, tussenvoegsel, achternaam, roepnaam, geslacht, geboorteplaats, provincie, geboortedatum, datum_overlijden, datum_begraven, rol, functie, bijzonderheden, reden_overlijden, grave_id, zichtbaar_graf, gehuwd_met, datum_huwelijk, urn, locatie, soort_graf, aankomst_neerbosch, voorheen_pupil, vader, moeder, piketnummer, uitstrooien, verblijfsduur, opleiding, pupil, plaats_huwelijk, leeftijd_tijdens_overlijden) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)`,
          values: [
            uuid, excelRow.Voornamen, excelRow.Tussenvoegsel, excelRow.Achternaam, excelRow.Roepnaam, excelRow.Sexe, excelRow.Geboorteplaats, excelRow.Provincie, excelRow.Geboortedatum, excelRow.Overlijden, excelRow.Begraven, excelRow.Rol, excelRow.Functie, excelRow.Bijzonderheden, excelRow.RedenOverlijden, excelRow.Grafnummer, excelRow.ZichtbaarGraf, 
            excelRow.GehuwdMet, excelRow.DatumHuwelijk, excelRow.Urn, excelRow.Locatie, excelRow.SoortGraf, excelRow.AankomstNeerbosch, excelRow.VoorheenPupil, excelRow.Vader, 
            excelRow.Moeder, excelRow.Piketnummer, excelRow.Uitstrooien, excelRow.Verblijfsduur, excelRow.Opleiding, excelRow.Pupil, excelRow.PlaatsHuwelijk, excelRow.Leeftijd
          ]
        };
        await client.query(insertQuery);
        // console.log(`Successfully inserted new row with reference ${tableReference} into ${tableName}`);
        console.log(`Successfully inserted new row with search reference ${columnReference} into ${tableName}`);
      }
    }
  console.log(`Closing database connection..`);
  await client.end();
}

module.exports = {
  compareAndUpdateData
}