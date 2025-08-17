import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testResponseStructure() {
  console.log('🔍 Testing API Response Structure...\n');
  
  try {
    // Test signup response structure
    console.log('1. Testing signup response structure...');
    const testUser = {
      name: 'Response Test User',
      email: `responsetest${Date.now()}@example.com`,
      password: 'testpassword123'
    };
    
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, testUser);
    
    console.log('Raw axios response structure:');
    console.log('- signupResponse.status:', signupResponse.status);
    console.log('- signupResponse.data:', JSON.stringify(signupResponse.data, null, 2));
    console.log('- signupResponse.data.data:', JSON.stringify(signupResponse.data.data, null, 2));
    
    // Test what the frontend API interceptor would return
    const interceptedResponse = signupResponse.data; // This is what the interceptor returns
    console.log('\nWhat frontend receives after interceptor:');
    console.log('- res:', JSON.stringify(interceptedResponse, null, 2));
    console.log('- res.data:', JSON.stringify(interceptedResponse.data, null, 2));
    
    // Test login response structure
    console.log('\n2. Testing login response structure...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('Raw login response:');
    console.log('- loginResponse.data:', JSON.stringify(loginResponse.data, null, 2));
    console.log('- loginResponse.data.data:', JSON.stringify(loginResponse.data.data, null, 2));
    
    console.log('\n✅ Response structure analysis complete!');
    console.log('\n📋 Summary:');
    console.log('- Backend returns: { success: true, data: { token, user } }');
    console.log('- Frontend interceptor returns: response.data');
    console.log('- Frontend should access: res.data (not res.data.data)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testResponseStructure();
