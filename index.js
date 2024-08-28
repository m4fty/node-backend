const express = require('express');
const app = express();
const port = 3000; // Puedes cambiar el puerto si lo prefieres

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
