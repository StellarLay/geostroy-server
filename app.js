import express from 'express';

import apiRouter from './routes/api.routes.js';
import authRouter from './routes/auth.routes.js';
import dataRouter from './routes/data.routes.js';

const app = express();
const PORT = 5000;

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

app.listen(PORT, () => {
  console.log(`App has been started on ${PORT}...`);
});
