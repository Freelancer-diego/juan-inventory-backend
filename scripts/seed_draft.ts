
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
      password: 'admin123456(secure)' // Assuming these are the seeded creds or I should fallback?
      // Wait, I don't know the admin credentials for sure. 
      // The user prompt said: "Login mediante JWT". 
      // Often default is admin/admin or similar. 
      // I will assume I need to create an admin first OR use existing.
      // IF I can't login, I can't create products? 
      // Let's check ProductController. @UseGuards(JwtAuthGuard, RolesGuard) on create.
      // So I NEED a token.
      
      // I will try to login with common credentials. 
      // If it fails, I might need to insert an Admin directly to DB? 
      // Or maybe the user already has one.
      // The user provided prompt context doesn't specify default admin.
    });
    token = loginRes.data.access_token;
    console.log('Logged in as Admin.');
  } catch (error) {
    console.error('Login failed. Please ensure admin exists.');
    // Fallback: Try to register or assume hardcoded token if debugging? No.
    // I'll try to insert admin directly if I can, but I don't have direct DB access easily via script without installing mongoose here.
    // I'll assume valid credentials for now: 'admin@admin.com' / 'admin123' or similar. 
    // Actually, I'll update the script to just ask for token or try a default.
    // Let's assume the user has a way to login. 
    // Wait, I am the developer. I should know.
    // I haven't seen an "Admin Seeder" yet. 
    // I should probably ensure an Admin exists.
    
    // RETRY PLAN:
    // I will look at `authenticate-admin.usecase.ts` or `admin.repository.ts` to see if there are hardcoded admins or how to create one.
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
      if (e.response && e.response.status === 409) { // Conflict
         // Update if exists? ProductController has @Put but I'll skip if exists
         console.log(`Product ${p.name} already exists. Updating...`);
         await axios.put(`${API_URL}/products/${p.id}`, p, {
             headers: { Authorization: `Bearer ${token}` }
         });
      } else {
         console.error(`Failed to create ${p.name}:`, e.message);
      }
    }
  }

  // 3. Create Sales (PENDING)
  // Sales creation is public usually? SaleController @Post() has NO guards. Good.
  console.log('Creating sales...');
  const sales = [
     {
         id: 'sale-1001',
         items: [
             { productId: 'prod-001', quantity: 1, unitPrice: 1999.99, subtotal: 1999.99 }, // MacBook
             { productId: 'prod-004', quantity: 1, unitPrice: 99.99, subtotal: 99.99 } // Mouse
         ]
     },
     {
         id: 'sale-1002',
         items: [
             { productId: 'prod-002', quantity: 2, unitPrice: 999.00, subtotal: 1998.00 } // 2 iPhones
         ]
     },
     {
         id: 'sale-1003',
         items: [
             { productId: 'prod-006', quantity: 1, unitPrice: 89.00, subtotal: 89.00 } // Keyboard
         ]
     },
      {
         id: 'sale-1004',
         items: [
             { productId: 'prod-008', quantity: 1, unitPrice: 249.00, subtotal: 249.00 } // AirPods
         ]
     }
  ];

  for (const s of sales) {
      try {
          await axios.post(`${API_URL}/sales`, s);
          console.log(`Created sale: ${s.id}`);
      } catch (e: any) {
          console.error(`Failed to create sale ${s.id}:`, e.message);
      }
  }

  console.log('Seeding complete!');
}

seed();
