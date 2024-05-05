require('dotenv').config();
import express from 'express';
import routes from './routes'
import cors from 'cors';

const app = express();

app.use(
  express.urlencoded({
      extended: true,
  })
);

const PORT = process.env.PORT || 8000;

app.use(cors());

app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
