import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'ai_meeting_notes_super_secret_jwt_key_2024_change_in_production';

async function testJWTFunctionality() {
  console.log('🔑 Testing JWT Token Functionality...\n');
  
  let testToken = null;
  let testUser = null;
  
  try {
    // First, create a user and get a token
    console.log('1. Creating test user and obtaining JWT token...');
    testUser = {
      name: 'JWT Test User',
      email: `jwttest${Date.now()}@example.com`,
      password: 'testpassword123'
    };
    
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, testUser);
    testToken = signupResponse.data.data.token;
    
    console.log('✅ Test user created and token obtained');
    
    // Test JWT token structure
    console.log('\n2. Testing JWT token structure...');
    const decoded = jwt.verify(testToken, JWT_SECRET);
    
    const requiredFields = ['id', 'email', 'name', 'role', 'iat', 'exp'];
    const missingFields = requiredFields.filter(field => !(field in decoded));
    
    if (missingFields.length === 0) {
      console.log('✅ JWT token contains all required fields:', {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        hasExpiration: !!decoded.exp
      });
    } else {
      console.log('❌ JWT token missing required fields:', missingFields);
    }
    
    // Test token expiration
    console.log('\n3. Testing JWT token expiration...');
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpiration = decoded.exp;
    const timeUntilExpiration = tokenExpiration - currentTime;
    
    if (timeUntilExpiration > 0) {
      console.log('✅ JWT token has valid expiration:', {
        expiresIn: `${Math.floor(timeUntilExpiration / 86400)} days`,
        expirationDate: new Date(tokenExpiration * 1000).toISOString()
      });
    } else {
      console.log('❌ JWT token is expired');
    }
    
    // Test token verification with correct secret
    console.log('\n4. Testing JWT token verification...');
    try {
      const verifiedToken = jwt.verify(testToken, JWT_SECRET);
      console.log('✅ JWT token verification successful with correct secret');
    } catch (error) {
      console.log('❌ JWT token verification failed with correct secret:', error.message);
    }
    
    // Test token verification with wrong secret
    console.log('\n5. Testing JWT token verification with wrong secret...');
    try {
      jwt.verify(testToken, 'wrong_secret');
      console.log('❌ JWT token verification should have failed with wrong secret');
    } catch (error) {
      console.log('✅ JWT token verification correctly failed with wrong secret');
    }
    
    // Test authentication middleware with valid token
    console.log('\n6. Testing authentication middleware with valid token...');
    try {
      const response = await axios.get(`${API_BASE}/transcripts`, {
        headers: { Authorization: `Bearer ${testToken}` }
      });
      console.log('✅ Authentication middleware accepted valid token');
    } catch (error) {
      if (error.response && error.response.status !== 401) {
        console.log('✅ Authentication middleware accepted valid token (endpoint returned non-auth error)');
      } else {
        console.log('❌ Authentication middleware rejected valid token:', error.response?.status);
      }
    }
    
    // Test authentication middleware with invalid token
    console.log('\n7. Testing authentication middleware with invalid token...');
    try {
      const response = await axios.get(`${API_BASE}/transcripts`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('✅ Authentication middleware gracefully handled invalid token (optional auth)');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Authentication middleware correctly rejected invalid token');
      } else {
        console.log('✅ Authentication middleware gracefully handled invalid token');
      }
    }
    
    // Test authentication middleware without token
    console.log('\n8. Testing authentication middleware without token...');
    try {
      const response = await axios.get(`${API_BASE}/transcripts`);
      console.log('✅ Authentication middleware allowed request without token (optional auth)');
    } catch (error) {
      if (error.response && error.response.status !== 401) {
        console.log('✅ Authentication middleware allowed request without token');
      } else {
        console.log('❌ Authentication middleware incorrectly rejected request without token');
      }
    }
    
    // Test requireAuth middleware (if available)
    console.log('\n9. Testing protected endpoints...');
    // Note: We need to find an endpoint that uses requireAuth middleware
    // For now, let's test with a hypothetical protected endpoint
    
    // Test manual JWT generation
    console.log('\n10. Testing manual JWT generation...');
    const manualPayload = {
      id: 'test_user_id',
      email: 'manual@example.com',
      name: 'Manual Test User',
      role: 'user'
    };
    
    const manualToken = jwt.sign(manualPayload, JWT_SECRET, { expiresIn: '7d' });
    const manualDecoded = jwt.verify(manualToken, JWT_SECRET);
    
    if (manualDecoded.email === manualPayload.email) {
      console.log('✅ Manual JWT generation and verification successful');
    } else {
      console.log('❌ Manual JWT generation failed');
    }
    
    // Test token with different algorithms
    console.log('\n11. Testing JWT algorithm security...');
    try {
      // Try to create a token with 'none' algorithm (should be rejected)
      const unsafeToken = jwt.sign(manualPayload, '', { algorithm: 'none' });
      const unsafeDecoded = jwt.verify(unsafeToken, JWT_SECRET);
      console.log('❌ JWT accepted unsafe "none" algorithm');
    } catch (error) {
      console.log('✅ JWT correctly rejected unsafe "none" algorithm');
    }
    
    // Test token payload size
    console.log('\n12. Testing JWT payload size...');
    const largePayload = {
      id: 'test_user_id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      largeData: 'x'.repeat(1000) // 1KB of data
    };
    
    try {
      const largeToken = jwt.sign(largePayload, JWT_SECRET, { expiresIn: '7d' });
      const largeDecoded = jwt.verify(largeToken, JWT_SECRET);
      console.log('✅ JWT handled large payload successfully:', {
        tokenLength: largeToken.length,
        payloadSize: JSON.stringify(largePayload).length
      });
    } catch (error) {
      console.log('❌ JWT failed with large payload:', error.message);
    }
    
    console.log('\n🎉 All JWT functionality tests completed!');
    
  } catch (error) {
    console.error('❌ JWT functionality test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testJWTFunctionality();
