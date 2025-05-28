#!/usr/bin/env node

// Simple API test script to verify endpoints are working
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let authCookie = '';

// Test utilities
const test = (name, fn) => {
  console.log(`🧪 Testing: ${name}`);
  return fn();
};

const expect = (actual, expected, message = '') => {
  if (actual === expected) {
    console.log(`  ✅ ${message || 'Test passed'}`);
    return true;
  } else {
    console.log(`  ❌ ${message || 'Test failed'}: expected ${expected}, got ${actual}`);
    return false;
  }
};

// API request helper
const apiRequest = async (method, endpoint, data = null, includeCookie = false) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(includeCookie && authCookie ? { 'Cookie': authCookie } : {})
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  
  // Save auth cookie if present
  if (response.headers.get('set-cookie')) {
    authCookie = response.headers.get('set-cookie');
  }

  return {
    status: response.status,
    data: response.headers.get('content-type')?.includes('application/json') 
      ? await response.json() 
      : await response.text()
  };
};

// Test suite
async function runTests() {
  console.log('🚀 Starting API Tests\n');

  try {
    // Test 1: User Registration
    await test('User Registration', async () => {
      const testUser = `test_${Date.now()}`;
      const response = await apiRequest('POST', '/api/register', {
        username: testUser,
        password: 'test123'
      });
      
      expect(response.status, 201, 'Registration status');
      expect(typeof response.data.id, 'number', 'User ID returned');
      expect(response.data.username, testUser, 'Username matches');
    });

    // Test 2: User Login
    await test('User Login', async () => {
      const response = await apiRequest('POST', '/api/login', {
        username: `test_${Date.now() - 1000}`, // Use recent test user
        password: 'test123'
      });
      
      expect(response.status, 200, 'Login status');
      expect(typeof response.data.id, 'number', 'User ID in response');
    });

    // Test 3: Get Current User
    await test('Get Current User', async () => {
      const response = await apiRequest('GET', '/api/user', null, true);
      expect(response.status, 200, 'Get user status');
      expect(typeof response.data.username, 'string', 'Username in response');
    });

    // Test 4: Create Conversation
    await test('Create Conversation', async () => {
      const response = await apiRequest('POST', '/api/conversations', {
        title: 'Test Conversation'
      }, true);
      
      expect(response.status, 201, 'Create conversation status');
      expect(response.data.title, 'Test Conversation', 'Conversation title');
    });

    // Test 5: Get Conversations
    await test('Get Conversations', async () => {
      const response = await apiRequest('GET', '/api/conversations', null, true);
      expect(response.status, 200, 'Get conversations status');
      expect(Array.isArray(response.data), true, 'Response is array');
    });

    // Test 6: Authentication Required
    await test('Authentication Required', async () => {
      const response = await apiRequest('GET', '/api/user');
      expect(response.status, 401, 'Unauthenticated request rejected');
    });

    // Test 7: Invalid Login
    await test('Invalid Login', async () => {
      const response = await apiRequest('POST', '/api/login', {
        username: 'nonexistent',
        password: 'wrong'
      });
      expect(response.status, 401, 'Invalid login rejected');
    });

    // Test 8: File Upload Endpoint (without file)
    await test('File Upload Validation', async () => {
      const response = await apiRequest('POST', '/api/files/upload', null, true);
      expect(response.status, 400, 'File upload without file rejected');
    });

    console.log('\n🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/user`);
    if (response.status === 401) {
      console.log('✅ Server is running and responding\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running. Please start it with: npm run dev');
    process.exit(1);
  }
}

// Run tests
checkServer().then(runTests);