import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🔐 Testing Authentication Endpoints...\n');
  
  try {
    // Test health check first
    console.log('1. Testing health check...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test signup
    console.log('\n2. Testing signup...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    };
    
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, testUser);
    console.log('✅ Signup successful:', {
      status: signupResponse.status,
      success: signupResponse.data.success,
      hasToken: !!signupResponse.data.data.token,
      userEmail: signupResponse.data.data.user.email
    });
    
    // Test login
    console.log('\n3. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', {
      status: loginResponse.status,
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.data.token,
      userEmail: loginResponse.data.data.user.email
    });
    
    // Test invalid login
    console.log('\n4. Testing invalid login...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Invalid login correctly rejected:', error.response.status);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test duplicate signup
    console.log('\n5. Testing duplicate signup...');
    try {
      await axios.post(`${API_BASE}/auth/signup`, testUser);
      console.log('❌ Duplicate signup should have failed');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('✅ Duplicate signup correctly rejected:', error.response.status);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    console.log('\n🎉 All basic authentication tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();
