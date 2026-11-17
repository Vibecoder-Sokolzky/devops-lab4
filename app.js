const express = require('express');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = redis.createClient({ url: REDIS_URL });
client.on('error', (err) => console.log('Redis Client Error', err));

app.get('/', async (req, res) => {
  let visits = 'Brak połączenia z Redis (tryb pojedynczego kontenera)';
  try {
    if (!client.isOpen) await client.connect();
    visits = await client.incr('visits');
  } catch (e) {
    visits = 'Tryb bez bazy danych (OK)';
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <title>DevOps Lab 4</title>
      <style>
        body { background: #0f172a; color: #f8fafc; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2rem 3rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; border: 1px solid #334155; }
        .badge { background: #22c55e; color: #052e16; padding: 4px 12px; border-radius: 999px; font-weight: bold; font-size: 0.85rem; }
        h1 { margin-top: 1rem; font-size: 1.8rem; }
        .counter { font-size: 2.5rem; font-weight: bold; color: #38bdf8; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">Wersja 1.0 - Deployment OK</span>
        <h1>Automatyzacja Deploymentu - Lab 4</h1>
        <p>Liczba odwiedzin w bazie Redis:</p>
        <div class="counter">${visits}</div>
      </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Aplikacja działa na porcie ${PORT}`));
