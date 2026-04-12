
async function verify() {
  console.log('Verifying Authentication...');

  try {
    // 1. Login
    console.log('1. Attempting Login...');
    const loginResponse = await fetch('http://localhost:3000/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'securePassword123',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    
    if (!token) {
      throw new Error('No access token received');
    }
    console.log('✅ Login successful. Token received.');

    // 2. Access Protected Route (Validate Sale)
    // We need a sale ID. We'll try to validate a fake one to check Authorization header is accepted.
    // Expecting 404 (Sale Not Found) or 400, but NOT 401/403.
    console.log('2. Accessing Protected Route (Validate Sale)...');
    const validateResponse = await fetch('http://localhost:3000/sales/fake-id/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (validateResponse.status === 401 || validateResponse.status === 403) {
      throw new Error(`Auth failed on protected route: ${validateResponse.status}`);
    }

    console.log(`✅ Protected route accessed. Status: ${validateResponse.status} (Expected 404/400, not 401/403)`);

  } catch (error) {
    console.error('❌ Verification Failed:', error);
    process.exit(1);
  }
}

verify();
