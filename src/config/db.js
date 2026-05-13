// Ruta: config/db.js
require('dotenv').config({ override: true });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a Supabase:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a la base de datos (Modular)');
  }
});

module.exports = pool;