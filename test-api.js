const TEST_URL = 'https://backed-blond.vercel.app';

// 封装请求函数：自动处理 JSON stringify 和 headers
async function request(endpoint, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = {
    method: data ? 'POST' : 'GET',
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data); // 在这里统一处理

    console.log('config.body', config.body);
  }

  const res = await fetch(`${TEST_URL}${endpoint}`, config);
  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.message || JSON.stringify(responseData));
  }

  return responseData;
}

async function testApi() {
  console.log(`🚀 Testing API at: ${TEST_URL}\n`);

  const timestamp = Date.now();
  const testUser = {
    email: `test${timestamp}@example.com`,
    password: 'password123',
    name: `Test User ${timestamp}`,
  };

  try {
    // 1. Register - 直接传对象
    console.log('1️⃣  Testing Register...');
    const registerData = await request('/auth/register', testUser);

    console.log('✅ Register successful:', registerData.user.email);
    console.log('   Token:', registerData.accessToken?.substring(0, 20) + '...\n');

    const token = registerData.accessToken;

    // 2. Login - 直接传对象
    console.log('2️⃣  Testing Login...');
    const loginData = await request('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    console.log('✅ Login successful\n');

    // 3. Get Profile - 传 token
    console.log('3️⃣  Testing Protected Route (/auth/me)...');
    const profileData = await request('/auth/me', null, token);

    console.log('✅ Profile retrieved:', profileData.email);
    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testApi();
