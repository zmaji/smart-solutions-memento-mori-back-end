const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('HALLO DIT IS EEN WEBAPPLICATIE!!!!');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});