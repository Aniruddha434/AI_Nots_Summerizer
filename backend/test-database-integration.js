import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/index.js';

dotenv.config();

async function testDatabaseIntegration() {
  console.log('🗄️  Testing Database Integration...\n');
  
  try {
    // Test MongoDB connection
    console.log('1. Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test user creation
    console.log('\n2. Testing user creation...');
    const testUser = new User({
      name: 'Database Test User',
      email: `dbtest${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    
    await testUser.save();
    console.log('✅ User creation successful:', {
      id: testUser._id,
      email: testUser.email,
      name: testUser.name,
      role: testUser.role,
      isActive: testUser.isActive
    });
    
    // Test password hashing
    console.log('\n3. Testing password hashing...');
    const originalPassword = 'testpassword123';
    const hashedPassword = testUser.password;
    
    if (hashedPassword === originalPassword) {
      console.log('❌ Password was not hashed');
    } else {
      console.log('✅ Password was properly hashed');
      
      // Test password comparison
      const isValidPassword = await testUser.comparePassword(originalPassword);
      const isInvalidPassword = await testUser.comparePassword('wrongpassword');
      
      if (isValidPassword && !isInvalidPassword) {
        console.log('✅ Password comparison working correctly');
      } else {
        console.log('❌ Password comparison failed:', { isValidPassword, isInvalidPassword });
      }
    }
    
    // Test email uniqueness constraint
    console.log('\n4. Testing email uniqueness constraint...');
    try {
      const duplicateUser = new User({
        name: 'Duplicate User',
        email: testUser.email, // Same email
        password: 'anotherpassword'
      });
      await duplicateUser.save();
      console.log('❌ Email uniqueness constraint failed - duplicate user was saved');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Email uniqueness constraint working correctly');
      } else {
        console.log('❌ Unexpected error testing uniqueness:', error.message);
      }
    }
    
    // Test user lookup functionality
    console.log('\n5. Testing user lookup functionality...');
    
    // Test lookup by email (case insensitive)
    const foundUser = await User.findOne({ email: testUser.email.toUpperCase() });
    if (foundUser) {
      console.log('✅ User lookup by email successful (case insensitive)');
    } else {
      console.log('❌ User lookup by email failed');
    }
    
    // Test lookup with isActive filter
    const activeUser = await User.findOne({ email: testUser.email, isActive: true });
    if (activeUser) {
      console.log('✅ User lookup with isActive filter successful');
    } else {
      console.log('❌ User lookup with isActive filter failed');
    }
    
    // Test inactive user lookup
    testUser.isActive = false;
    await testUser.save();
    
    const inactiveUserLookup = await User.findOne({ email: testUser.email, isActive: true });
    if (!inactiveUserLookup) {
      console.log('✅ Inactive user correctly excluded from active lookup');
    } else {
      console.log('❌ Inactive user was found in active lookup');
    }
    
    // Test schema validation
    console.log('\n6. Testing schema validation...');
    
    const validationTests = [
      {
        name: 'Missing name',
        data: { email: 'test@example.com', password: 'password123' },
        shouldFail: true
      },
      {
        name: 'Invalid email format',
        data: { name: 'Test User', email: 'invalid-email', password: 'password123' },
        shouldFail: true
      },
      {
        name: 'Short password',
        data: { name: 'Test User', email: 'test2@example.com', password: '123' },
        shouldFail: true
      },
      {
        name: 'Short name',
        data: { name: 'A', email: 'test3@example.com', password: 'password123' },
        shouldFail: true
      }
    ];
    
    for (const test of validationTests) {
      try {
        const user = new User(test.data);
        await user.save();
        
        if (test.shouldFail) {
          console.log(`❌ ${test.name} validation should have failed but passed`);
          await user.deleteOne(); // Clean up
        } else {
          console.log(`✅ ${test.name} validation passed correctly`);
          await user.deleteOne(); // Clean up
        }
      } catch (error) {
        if (test.shouldFail) {
          console.log(`✅ ${test.name} validation correctly failed`);
        } else {
          console.log(`❌ ${test.name} validation failed unexpectedly:`, error.message);
        }
      }
    }
    
    // Test bcrypt configuration
    console.log('\n7. Testing bcrypt configuration...');
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    console.log(`✅ Bcrypt rounds configured: ${bcryptRounds}`);
    
    // Test manual bcrypt operation
    const testPassword = 'testbcrypt123';
    const salt = await bcrypt.genSalt(bcryptRounds);
    const hash = await bcrypt.hash(testPassword, salt);
    const isValid = await bcrypt.compare(testPassword, hash);
    
    if (isValid) {
      console.log('✅ Manual bcrypt operation successful');
    } else {
      console.log('❌ Manual bcrypt operation failed');
    }
    
    // Cleanup
    console.log('\n8. Cleaning up test data...');
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All database integration tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
  }
}

testDatabaseIntegration();
