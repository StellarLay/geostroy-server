import express from 'express';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from 'config';
import router from './routes/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers'
  );
  next();
});
app.use('/api', router);

app.use(express.static(path.join(__dirname, '../geostroy-client/build')));

// get static files from React
app.get('*', (request, response) => {
  response.sendFile(
    path.resolve(__dirname + '../geostroy-client/build/index.html')
  );
});

const HOST = config.HOST;
const PORT = config.PORT;

// set SSL certificates
var options = {
  key: fs.readFileSync('cert/private.key'),
  cert: fs.readFileSync('cert/public.crt'),
};

// Listen server
var server = https.createServer(options, app);

server.listen(PORT, HOST, function () {
  console.log(`Server has been started on https://${HOST}:${PORT}`);
});
