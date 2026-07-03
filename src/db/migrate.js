const pool = require('../config/db');

async function runMigrations() {
    const statements = [
        `ALTER TABLE productos ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE`,
        `ALTER TABLE productos ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo'`,
        `ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`,
        `ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,
        `ALTER TABLE main_products ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE`,
        `ALTER TABLE main_products ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo'`,
        `ALTER TABLE usuarios ALTER COLUMN rol SET DEFAULT 'cliente'`
    ];

    for (const sql of statements) {
        await pool.query(sql);
    }

    console.log('✅ Migraciones de admin aplicadas correctamente');
}

module.exports = { runMigrations };
