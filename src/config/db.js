// Ruta: src/config/db.js
require('dotenv').config({ override: true });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necesario para Supabase
  },
  max: 10,               // máximo de conexiones simultáneas (Supabase free limita a 15)
  idleTimeoutMillis: 30000, // cierra conexiones inactivas después de 30s
  connectionTimeoutMillis: 5000 // tiempo máximo de espera para obtener conexión
});

// Test de conexión inicial
pool.query('SELECT NOW()')
  .then(res => {
    console.log('Conexión exitosa a la base de datos (Pool activo)');
  })
  .catch(err => {
    console.error('Error conectando a Supabase:', err.stack);
  });

module.exports = pool;
