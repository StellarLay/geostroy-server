import express from 'express';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from 'config';
import router from './routes/auth.routes.js';

import apiRouter from './routes/api.routes.js';
import authRouter from './routes/auth.routes.js';
import dataRouter from './routes/data.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT, DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});
app.use('/api', apiRouter);
app.use('/auth', authRouter);
app.use('/data', dataRouter);

app.use(express.static(path.join('../geostroy-client/build')));

// get static files from React
app.get('/*', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../geostroy-client/build', 'index.html'),
    (err) => {
      if (err) {
        console.log(err);
      }
    }
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
