#!/usr/bin/env node

/**
 * Authentication API Testing Script
 * Comprehensive testing of signup and login authentication flow
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

class AuthAPITester {
  constructor() {
    this.testUsers = [];
    this.tokens = [];
  }

  async log(message, data = null) {
    console.log(`✓ ${message}`);
    if (data && process.env.VERBOSE) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }

  async error(message, error) {
    console.error(`✗ ${message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Error:`, error.response.data);
    } else {
      console.error('  Error:', error.message);
    }
  }

  generateTestUser(suffix = '') {
    const timestamp = Date.now();
    return {
      name: `Test User${suffix}`,
      email: `testuser${suffix}${timestamp}@example.com`,
      password: 'testpassword123'
    };
  }

  async testHealthCheck() {
    try {
      const response = await axios.get(`${API_BASE.replace('/api', '')}/health`);
      await this.log('Health check passed', response.data);
      return true;
    } catch (error) {
      await this.error('Health check failed', error);
      return false;
    }
  }

  async testSignupValidRequest() {
    try {
      const testUser = this.generateTestUser('_valid');
      const response = await axios.post(`${API_BASE}/auth/signup`, testUser);
      
      // Verify response structure
      if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
      }
      
      if (!response.data.success) {
        throw new Error('Response should indicate success');
      }
      
      if (!response.data.data.token) {
        throw new Error('Response should include JWT token');
      }
      
      if (!response.data.data.user) {
        throw new Error('Response should include user data');
      }
      
      // Verify JWT token
      const decoded = jwt.verify(response.data.data.token, process.env.JWT_SECRET || 'ai_meeting_notes_super_secret_jwt_key_2024_change_in_production');
      if (decoded.email !== testUser.email.toLowerCase()) {
        throw new Error('JWT token email mismatch');
      }
      
      this.testUsers.push(testUser);
      this.tokens.push(response.data.data.token);
      
      await this.log('Valid signup request successful', {
        email: testUser.email,
        userId: response.data.data.user.id,
        tokenValid: true
      });
      return true;
    } catch (error) {
      await this.error('Valid signup request failed', error);
      return false;
    }
  }

  async testSignupDuplicateEmail() {
    try {
      if (this.testUsers.length === 0) {
        console.log('⚠ Skipping duplicate email test - no existing user');
        return false;
      }
      
      const existingUser = this.testUsers[0];
      const response = await axios.post(`${API_BASE}/auth/signup`, existingUser);
      
      // This should fail
      await this.error('Duplicate email signup should have failed but succeeded', { status: response.status });
      return false;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        await this.log('Duplicate email correctly rejected', { status: 409 });
        return true;
      } else {
        await this.error('Duplicate email test failed with unexpected error', error);
        return false;
      }
    }
  }

  async testSignupValidationErrors() {
    const testCases = [
      {
        name: 'Missing name',
        data: { email: 'test@example.com', password: 'password123' },
        expectedStatus: 400
      },
      {
        name: 'Invalid email',
        data: { name: 'Test User', email: 'invalid-email', password: 'password123' },
        expectedStatus: 400
      },
      {
        name: 'Short password',
        data: { name: 'Test User', email: 'test@example.com', password: '123' },
        expectedStatus: 400
      },
      {
        name: 'Short name',
        data: { name: 'A', email: 'test@example.com', password: 'password123' },
        expectedStatus: 400
      }
    ];

    let allPassed = true;
    
    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${API_BASE}/auth/signup`, testCase.data);
        await this.error(`${testCase.name} validation should have failed but succeeded`, { status: response.status });
        allPassed = false;
      } catch (error) {
        if (error.response && error.response.status === testCase.expectedStatus) {
          await this.log(`${testCase.name} validation correctly rejected`, { status: testCase.expectedStatus });
        } else {
          await this.error(`${testCase.name} validation failed with unexpected error`, error);
          allPassed = false;
        }
      }
    }
    
    return allPassed;
  }

  async testLoginValidCredentials() {
    try {
      if (this.testUsers.length === 0) {
        console.log('⚠ Skipping valid login test - no existing user');
        return false;
      }
      
      const testUser = this.testUsers[0];
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      // Verify response structure
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      
      if (!response.data.success) {
        throw new Error('Response should indicate success');
      }
      
      if (!response.data.data.token) {
        throw new Error('Response should include JWT token');
      }
      
      // Verify JWT token
      const decoded = jwt.verify(response.data.data.token, process.env.JWT_SECRET || 'ai_meeting_notes_super_secret_jwt_key_2024_change_in_production');
      if (decoded.email !== testUser.email.toLowerCase()) {
        throw new Error('JWT token email mismatch');
      }
      
      await this.log('Valid login successful', {
        email: testUser.email,
        tokenValid: true
      });
      return true;
    } catch (error) {
      await this.error('Valid login failed', error);
      return false;
    }
  }

  async testLoginInvalidCredentials() {
    const testCases = [
      {
        name: 'Invalid email',
        data: { email: 'nonexistent@example.com', password: 'password123' },
        expectedStatus: 401
      },
      {
        name: 'Invalid password',
        data: { email: this.testUsers[0]?.email || 'test@example.com', password: 'wrongpassword' },
        expectedStatus: 401
      }
    ];

    let allPassed = true;
    
    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, testCase.data);
        await this.error(`${testCase.name} should have failed but succeeded`, { status: response.status });
        allPassed = false;
      } catch (error) {
        if (error.response && error.response.status === testCase.expectedStatus) {
          await this.log(`${testCase.name} correctly rejected`, { status: testCase.expectedStatus });
        } else {
          await this.error(`${testCase.name} failed with unexpected error`, error);
          allPassed = false;
        }
      }
    }
    
    return allPassed;
  }

  async testLoginValidationErrors() {
    const testCases = [
      {
        name: 'Missing email',
        data: { password: 'password123' },
        expectedStatus: 400
      },
      {
        name: 'Missing password',
        data: { email: 'test@example.com' },
        expectedStatus: 400
      },
      {
        name: 'Invalid email format',
        data: { email: 'invalid-email', password: 'password123' },
        expectedStatus: 400
      }
    ];

    let allPassed = true;
    
    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, testCase.data);
        await this.error(`${testCase.name} validation should have failed but succeeded`, { status: response.status });
        allPassed = false;
      } catch (error) {
        if (error.response && error.response.status === testCase.expectedStatus) {
          await this.log(`${testCase.name} validation correctly rejected`, { status: testCase.expectedStatus });
        } else {
          await this.error(`${testCase.name} validation failed with unexpected error`, error);
          allPassed = false;
        }
      }
    }
    
    return allPassed;
  }

  async testJWTTokenVerification() {
    try {
      if (this.tokens.length === 0) {
        console.log('⚠ Skipping JWT verification test - no tokens available');
        return false;
      }
      
      const token = this.tokens[0];
      const jwtSecret = process.env.JWT_SECRET || 'ai_meeting_notes_super_secret_jwt_key_2024_change_in_production';
      
      // Test token verification
      const decoded = jwt.verify(token, jwtSecret);
      
      // Verify token structure
      if (!decoded.id || !decoded.email || !decoded.name || !decoded.role) {
        throw new Error('JWT token missing required fields');
      }
      
      // Test token with protected endpoint (if available)
      try {
        const response = await axios.get(`${API_BASE}/transcripts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await this.log('JWT token authentication successful', { 
          decoded: { id: decoded.id, email: decoded.email, role: decoded.role },
          protectedEndpointAccess: true
        });
      } catch (error) {
        // This might fail if there are no transcripts, but the auth should work
        if (error.response && error.response.status !== 401) {
          await this.log('JWT token authentication successful (endpoint returned non-auth error)', { 
            decoded: { id: decoded.id, email: decoded.email, role: decoded.role },
            endpointStatus: error.response.status
          });
        } else {
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      await this.error('JWT token verification failed', error);
      return false;
    }
  }

  async runAllTests() {
    console.log('🔐 Starting Authentication API Tests...\n');
    console.log(`API Base URL: ${API_BASE}\n`);

    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Signup - Valid Request', fn: () => this.testSignupValidRequest() },
      { name: 'Signup - Duplicate Email', fn: () => this.testSignupDuplicateEmail() },
      { name: 'Signup - Validation Errors', fn: () => this.testSignupValidationErrors() },
      { name: 'Login - Valid Credentials', fn: () => this.testLoginValidCredentials() },
      { name: 'Login - Invalid Credentials', fn: () => this.testLoginInvalidCredentials() },
      { name: 'Login - Validation Errors', fn: () => this.testLoginValidationErrors() },
      { name: 'JWT Token Verification', fn: () => this.testJWTTokenVerification() }
    ];

    const results = [];

    for (const test of tests) {
      console.log(`\n🧪 Running: ${test.name}`);
      try {
        const result = await test.fn();
        results.push({ name: test.name, success: result });
      } catch (error) {
        console.error(`Unexpected error in ${test.name}:`, error.message);
        results.push({ name: test.name, success: false });
      }
    }

    // Results summary
    console.log('\n📊 Authentication Test Results:');
    console.log('================================');
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.name}`);
    });
    
    console.log(`\nTotal: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All authentication tests passed! The auth system is working correctly.');
      return true;
    } else {
      console.log('⚠️  Some authentication tests failed. Please check the issues above.');
      return false;
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AuthAPITester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default AuthAPITester;
