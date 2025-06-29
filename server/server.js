require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  console.log('Presiona CTRL-C para detener el servidor.');
}); 