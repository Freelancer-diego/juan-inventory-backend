
import axios from 'axios';

const API_URL = 'http://localhost:3000';

const products = [
  { id: 'prod-001', name: 'MacBook Pro 14 M3', price: 1999.99, stock: 15 },
  { id: 'prod-002', name: 'iPhone 15 Pro', price: 999.00, stock: 8 },
  { id: 'prod-003', name: 'Sony WH-1000XM5', price: 348.00, stock: 25 },
  { id: 'prod-004', name: 'Logitech MX Master 3S', price: 99.99, stock: 5 }, // Low stock
  { id: 'prod-005', name: 'Dell UltraSharp 27"', price: 450.00, stock: 12 },
  { id: 'prod-006', name: 'Keychron K2 Pro', price: 89.00, stock: 3 }, // Low stock
  { id: 'prod-007', name: 'iPad Air 5', price: 599.00, stock: 20 },
  { id: 'prod-008', name: 'AirPods Pro 2', price: 249.00, stock: 30 },
];

async function seed() {
  console.log('Starting seed process...');

  // 1. Login as Admin
  let token = '';
  try {
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@example.com',
      password: 'securePassword123' 
    });
    token = loginRes.data.access_token;
    console.log('Logged in as Admin.');
  } catch (error: any) {
    console.error('Login failed:', error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
    }
    return;
  }

  // 2. Create Products
  console.log('Creating products...');
  for (const p of products) {
    try {
      await axios.post(`${API_URL}/products`, p, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Created product: ${p.name}`);
    } catch (e: any) {
      if (e.response && e.response.status === 409) {
         console.log(`Product ${p.name} already exists. Skipping.`);
      } else {
         console.error(`Failed to create ${p.name}:`, e.message);
      }
    }
  }

  // 3. Create Sales (PENDING)
  console.log('Creating sales...');
  const sales = [
     {
         id: 'sale-1001',
         items: [
             { productId: 'prod-001', quantity: 1, unitPrice: 1999.99, subtotal: 1999.99 },
             { productId: 'prod-004', quantity: 1, unitPrice: 99.99, subtotal: 99.99 } 
         ]
     },
     {
         id: 'sale-1002',
         items: [
             { productId: 'prod-002', quantity: 2, unitPrice: 999.00, subtotal: 1998.00 }
         ]
     },
     {
         id: 'sale-1003',
         items: [
             { productId: 'prod-006', quantity: 1, unitPrice: 89.00, subtotal: 89.00 }
         ]
     },
      {
         id: 'sale-1004',
         items: [
             { productId: 'prod-008', quantity: 1, unitPrice: 249.00, subtotal: 249.00 }
         ]
     }
  ];

  for (const s of sales) {
      try {
          // Check if sale exists first? API doesn't have check endpoint easily exposed without token
          // Post will fail if duplicate usually.
          await axios.post(`${API_URL}/sales`, s);
          console.log(`Created sale: ${s.id}`);
      } catch (e: any) {
          if (e.response && e.response.status === 400 && e.response.data.message.includes('duplicate')) {
             // Assuming explicit error message
             console.log(`Sale ${s.id} might already exist or conflict.`);
          }
          // Just ignore conflicts for seeding
          console.log(`Result for ${s.id}: ${e.response ? e.response.status : e.message}`);
      }
  }

  console.log('Seeding complete!');
}

seed();
