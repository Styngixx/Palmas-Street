-- =============================================
-- Setup Admin Palmas Street
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Columnas para gestión de productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';
ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT FALSE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE main_products ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;
ALTER TABLE main_products ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';

-- 2. Crear usuario administrador
-- IMPORTANTE: Cambia el email y genera tu propio hash con:
-- node scripts/create-admin.js admin@palmastreet.com tuPassword123 Admin

-- Ejemplo (password: Admin123!):
-- INSERT INTO usuarios (nombre, email, password, rol)
-- VALUES ('Administrador', 'admin@palmastreet.com', '$2b$10$...hash...', 'admin')
-- ON CONFLICT (email) DO UPDATE SET rol = 'admin';
