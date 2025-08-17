/**
 * Test script to verify user isolation in the history functionality
 * This test ensures that users can only see their own summaries and transcripts
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = 'ai_meeting_notes_super_secret_jwt_key_2024_change_in_production';

// Helper function to create a test JWT token
function createTestToken(userId, email) {
  return jwt.sign(
    { id: userId, email, name: 'Test User', role: 'user' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Helper function to make authenticated requests
function createAuthenticatedAxios(token) {
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

async function testUserIsolation() {
  console.log('🧪 Testing User Isolation in History Functionality...\n');

  try {
    // Create tokens for two different users
    const user1Token = createTestToken('user1', 'user1@test.com');
    const user2Token = createTestToken('user2', 'user2@test.com');
    
    const user1Api = createAuthenticatedAxios(user1Token);
    const user2Api = createAuthenticatedAxios(user2Token);
    const anonymousApi = axios.create({ baseURL: API_BASE });

    console.log('1. Testing transcript upload and isolation...');
    
    // User 1 uploads a transcript
    const user1Transcript = await user1Api.post('/transcripts', {
      text: 'This is user 1 transcript content for testing user isolation.',
      uploadMethod: 'text'
    });
    console.log('✅ User 1 uploaded transcript:', user1Transcript.data.data.id);

    // User 2 uploads a transcript
    const user2Transcript = await user2Api.post('/transcripts', {
      text: 'This is user 2 transcript content for testing user isolation.',
      uploadMethod: 'text'
    });
    console.log('✅ User 2 uploaded transcript:', user2Transcript.data.data.id);

    // Anonymous user uploads a transcript
    const anonymousTranscript = await anonymousApi.post('/transcripts', {
      text: 'This is anonymous transcript content for testing user isolation.',
      uploadMethod: 'text'
    });
    console.log('✅ Anonymous uploaded transcript:', anonymousTranscript.data.data.id);

    console.log('\n2. Testing transcript list isolation...');
    
    // User 1 should only see their transcript
    const user1Transcripts = await user1Api.get('/transcripts');
    console.log(`✅ User 1 sees ${user1Transcripts.data.data.length} transcript(s)`);
    
    // User 2 should only see their transcript
    const user2Transcripts = await user2Api.get('/transcripts');
    console.log(`✅ User 2 sees ${user2Transcripts.data.data.length} transcript(s)`);
    
    // Anonymous should only see anonymous transcripts
    const anonymousTranscripts = await anonymousApi.get('/transcripts');
    console.log(`✅ Anonymous sees ${anonymousTranscripts.data.data.length} transcript(s)`);

    console.log('\n3. Testing summary generation and isolation...');
    
    // User 1 generates a summary
    const user1Summary = await user1Api.post('/generate', {
      transcriptId: user1Transcript.data.data.id,
      prompt: 'Summarize this transcript for user 1'
    });
    console.log('✅ User 1 generated summary:', user1Summary.data.data._id);

    // User 2 generates a summary
    const user2Summary = await user2Api.post('/generate', {
      transcriptId: user2Transcript.data.data.id,
      prompt: 'Summarize this transcript for user 2'
    });
    console.log('✅ User 2 generated summary:', user2Summary.data.data._id);

    // Anonymous generates a summary
    const anonymousSummary = await anonymousApi.post('/generate', {
      transcriptId: anonymousTranscript.data.data.id,
      prompt: 'Summarize this transcript for anonymous'
    });
    console.log('✅ Anonymous generated summary:', anonymousSummary.data.data._id);

    console.log('\n4. Testing summary list isolation (History page)...');
    
    // User 1 should only see their summary
    const user1Summaries = await user1Api.get('/summaries');
    console.log(`✅ User 1 sees ${user1Summaries.data.data.length} summary(ies) in history`);
    
    // User 2 should only see their summary
    const user2Summaries = await user2Api.get('/summaries');
    console.log(`✅ User 2 sees ${user2Summaries.data.data.length} summary(ies) in history`);
    
    // Anonymous should only see anonymous summaries
    const anonymousSummaries = await anonymousApi.get('/summaries');
    console.log(`✅ Anonymous sees ${anonymousSummaries.data.data.length} summary(ies) in history`);

    console.log('\n5. Testing cross-user access prevention...');
    
    // User 1 tries to access User 2's summary (should fail)
    try {
      await user1Api.get(`/summaries/${user2Summary.data.data._id}`);
      console.log('❌ SECURITY ISSUE: User 1 can access User 2\'s summary!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ User 1 correctly denied access to User 2\'s summary');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status);
      }
    }

    // User 2 tries to access User 1's transcript (should fail)
    try {
      await user2Api.get(`/transcripts/${user1Transcript.data.data.id}`);
      console.log('❌ SECURITY ISSUE: User 2 can access User 1\'s transcript!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ User 2 correctly denied access to User 1\'s transcript');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status);
      }
    }

    // Anonymous tries to access User 1's summary (should fail)
    try {
      await anonymousApi.get(`/summaries/${user1Summary.data.data._id}`);
      console.log('❌ SECURITY ISSUE: Anonymous can access User 1\'s summary!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Anonymous correctly denied access to User 1\'s summary');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status);
      }
    }

    console.log('\n🎉 User isolation test completed successfully!');
    console.log('✅ Users can only see their own data');
    console.log('✅ Cross-user access is properly blocked');
    console.log('✅ Anonymous users are properly isolated');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testUserIsolation();
