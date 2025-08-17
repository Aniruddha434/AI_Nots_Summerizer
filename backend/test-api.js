#!/usr/bin/env node

/**
 * API Testing Script
 * Tests the main API endpoints to ensure they're working correctly
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

// Test data
const TEST_TRANSCRIPT = `
This is a test meeting transcript for the AI Meeting Notes Summarizer application.

Meeting: Weekly Team Standup
Date: ${new Date().toLocaleDateString()}
Attendees: John Doe, Jane Smith, Bob Johnson

Agenda:
1. Project updates
2. Blockers and challenges
3. Next week planning

Discussion:
John reported that the frontend development is 80% complete. The main components are working well, but we need to add more error handling.

Jane mentioned that the backend API is fully functional with all endpoints tested. The database integration is working smoothly.

Bob discussed the deployment strategy. We plan to use Vercel for frontend and Render for backend.

Action Items:
- John: Complete error handling by Friday
- Jane: Write API documentation
- Bob: Set up production deployment

Next meeting: Same time next week.
`;

const TEST_PROMPT = "Summarize this meeting in bullet points, highlighting key decisions and action items.";

class APITester {
  constructor() {
    this.transcriptId = null;
    this.summaryId = null;
  }

  async log(message, data = null) {
    console.log(`✓ ${message}`);
    if (data && process.env.VERBOSE) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }

  async error(message, error) {
    console.error(`✗ ${message}`);
    console.error('  Error:', error.response?.data || error.message);
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

  async testTranscriptUpload() {
    try {
      const response = await axios.post(`${API_BASE}/transcripts`, {
        text: TEST_TRANSCRIPT,
        uploaderId: 'test-user'
      });
      
      this.transcriptId = response.data.data.id;
      await this.log('Transcript upload successful', { id: this.transcriptId });
      return true;
    } catch (error) {
      await this.error('Transcript upload failed', error);
      return false;
    }
  }

  async testTranscriptRetrieval() {
    if (!this.transcriptId) {
      console.log('⚠ Skipping transcript retrieval - no transcript ID');
      return false;
    }

    try {
      const response = await axios.get(`${API_BASE}/transcripts/${this.transcriptId}`);
      await this.log('Transcript retrieval successful', { 
        id: response.data.data._id,
        wordCount: response.data.data.metadata.wordCount 
      });
      return true;
    } catch (error) {
      await this.error('Transcript retrieval failed', error);
      return false;
    }
  }

  async testSummaryGeneration() {
    if (!this.transcriptId) {
      console.log('⚠ Skipping summary generation - no transcript ID');
      return false;
    }

    try {
      const response = await axios.post(`${API_BASE}/generate`, {
        transcriptId: this.transcriptId,
        prompt: TEST_PROMPT
      });
      
      this.summaryId = response.data.data._id;
      await this.log('Summary generation successful', { 
        id: this.summaryId,
        contentLength: response.data.data.generatedContent.length 
      });
      return true;
    } catch (error) {
      await this.error('Summary generation failed', error);
      return false;
    }
  }

  async testSummaryUpdate() {
    if (!this.summaryId) {
      console.log('⚠ Skipping summary update - no summary ID');
      return false;
    }

    try {
      const editedContent = "This is an edited version of the summary with additional details and formatting.";
      const response = await axios.put(`${API_BASE}/summaries/${this.summaryId}`, {
        editedContent
      });
      
      await this.log('Summary update successful', { 
        version: response.data.data.currentVersion 
      });
      return true;
    } catch (error) {
      await this.error('Summary update failed', error);
      return false;
    }
  }

  async testEmailServiceStatus() {
    try {
      const response = await axios.get(`${API_BASE}/share/status`);
      await this.log('Email service status check', { 
        configured: response.data.data.configured,
        ready: response.data.data.ready 
      });
      return response.data.data.ready;
    } catch (error) {
      await this.error('Email service status check failed', error);
      return false;
    }
  }

  async testEmailSharing() {
    if (!this.summaryId) {
      console.log('⚠ Skipping email sharing - no summary ID');
      return false;
    }

    // Check if email service is configured
    const emailReady = await this.testEmailServiceStatus();
    if (!emailReady) {
      console.log('⚠ Skipping email sharing - email service not configured');
      return false;
    }

    try {
      const response = await axios.post(`${API_BASE}/share`, {
        summaryId: this.summaryId,
        recipients: [TEST_EMAIL],
        subject: 'Test Summary from API Test',
        message: 'This is a test email sent from the API testing script.'
      });
      
      await this.log('Email sharing successful', { 
        recipients: response.data.data.recipients,
        messageId: response.data.data.messageId 
      });
      return true;
    } catch (error) {
      await this.error('Email sharing failed', error);
      return false;
    }
  }

  async testCleanup() {
    const cleanupTasks = [];

    // Delete summary
    if (this.summaryId) {
      cleanupTasks.push(
        axios.delete(`${API_BASE}/summaries/${this.summaryId}`)
          .then(() => this.log('Summary deleted'))
          .catch(error => this.error('Summary deletion failed', error))
      );
    }

    // Delete transcript
    if (this.transcriptId) {
      cleanupTasks.push(
        axios.delete(`${API_BASE}/transcripts/${this.transcriptId}`)
          .then(() => this.log('Transcript deleted'))
          .catch(error => this.error('Transcript deletion failed', error))
      );
    }

    await Promise.all(cleanupTasks);
  }

  async runAllTests() {
    console.log('🚀 Starting API Tests...\n');
    console.log(`API Base URL: ${API_BASE}`);
    console.log(`Test Email: ${TEST_EMAIL}\n`);

    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Transcript Upload', fn: () => this.testTranscriptUpload() },
      { name: 'Transcript Retrieval', fn: () => this.testTranscriptRetrieval() },
      { name: 'Summary Generation', fn: () => this.testSummaryGeneration() },
      { name: 'Summary Update', fn: () => this.testSummaryUpdate() },
      { name: 'Email Service Status', fn: () => this.testEmailServiceStatus() },
      { name: 'Email Sharing', fn: () => this.testEmailSharing() }
    ];

    const results = [];

    for (const test of tests) {
      console.log(`\n📋 Running: ${test.name}`);
      try {
        const result = await test.fn();
        results.push({ name: test.name, success: result });
      } catch (error) {
        console.error(`Unexpected error in ${test.name}:`, error.message);
        results.push({ name: test.name, success: false });
      }
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await this.testCleanup();

    // Results summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.name}`);
    });
    
    console.log(`\nTotal: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! The API is working correctly.');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please check the configuration and try again.');
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new APITester();
  tester.runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default APITester;
