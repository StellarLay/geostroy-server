import express from 'express';
import config from 'config';
import router from './routes/auth.routes.js';

const app = express();
const PORT = config.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`App has been started on ${PORT}...`);
});
