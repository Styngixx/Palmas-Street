/**
 * Genera el hash bcrypt para crear un admin en Supabase.
 * Uso: node scripts/create-admin.js email@ejemplo.com MiPassword123 "Nombre Admin"
 */
require('dotenv').config({ override: true });
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

async function createAdmin() {
    const email = process.argv[2];
    const password = process.argv[3];
    const nombre = process.argv[4] || 'Administrador';

    if (!email || !password) {
        console.log('Uso: node scripts/create-admin.js email@ejemplo.com MiPassword123 "Nombre Admin"');
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            `INSERT INTO usuarios (nombre, email, password, rol)
             VALUES ($1, $2, $3, 'admin')
             ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, rol = 'admin', nombre = EXCLUDED.nombre
             RETURNING id, nombre, email, rol`,
            [nombre, email, hash]
        );

        console.log('✅ Admin creado/actualizado:');
        console.log(result.rows[0]);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.log('\nSi no existe constraint UNIQUE en email, ejecuta manualmente:');
        console.log(`INSERT INTO usuarios (nombre, email, password, rol) VALUES ('${nombre}', '${email}', '${hash}', 'admin');`);
    } finally {
        await pool.end();
    }
}

createAdmin();
