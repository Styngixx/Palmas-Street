// Ruta: src/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necesario para Supabase
  },
  max: 2,                       // <- Reducido de 10 a 2 para evitar saturar el pool de 15 de Supabase
  idleTimeoutMillis: 10000,     // <- Cierra conexiones inactivas a los 10 segundos
  connectionTimeoutMillis: 5000 // <- Tiempo máximo de espera
});

// Manejo de errores en clientes inactivos del pool para no tumbar la app
pool.on('error', (err) => {
  console.error('⚠️ Error inesperado en el pool de PostgreSQL:', err.message);
});

// Test inicial de conexión
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Conexión exitosa a la base de datos (Pool activo)');
  })
  .catch(err => {
    console.error('❌ Error conectando a Supabase:', err.message);
  });

module.exports = pool;