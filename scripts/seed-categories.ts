/**
 * Script para crear las categorías iniciales del inventario:
 * - Ferretería
 * - Chatarería
 *
 * Uso: npx ts-node -r tsconfig-paths/register scripts/seed-categories.ts
 */

import axios from 'axios';

const API_URL = 'http://localhost:3000';

const CATEGORIES = [
  { id: 'cat-ferreteria', name: 'Ferretería' },
  { id: 'cat-chatareria', name: 'Chatarería' },
];

async function seedCategories() {
  console.log('📦 Iniciando seed de categorías...\n');

  // 1. Login como Admin
  let token = '';
  try {
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@example.com',
      password: 'securePassword123',
    });
    token = loginRes.data.access_token;
    console.log('✅ Login exitoso como Admin.');
  } catch (error: any) {
    console.error('❌ Login fallido:', error.message);
    if (error.response) {
      console.error('   Respuesta:', error.response.data);
    }
    process.exit(1);
  }

  // 2. Crear categorías
  console.log('\n🏷  Creando categorías...');
  for (const cat of CATEGORIES) {
    try {
      await axios.post(`${API_URL}/categories`, cat, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`  ✅ Categoría creada: ${cat.name} (${cat.id})`);
    } catch (e: any) {
      if (e.response && e.response.status === 409) {
        console.log(`  ⚠️  Categoría "${cat.name}" ya existe. Omitiendo.`);
      } else {
        console.error(`  ❌ Error al crear "${cat.name}":`, e.message);
        if (e.response) console.error('     Respuesta:', e.response.data);
      }
    }
  }

  console.log('\n🎉 Seed de categorías completado.');
}

seedCategories();
