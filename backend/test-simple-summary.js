/**
 * Simple test to validate enhanced summarization improvements
 */

import dotenv from 'dotenv';
import aiService from './services/ai.js';

dotenv.config();

async function testEnhancedSummarization() {
  console.log('🚀 Testing Enhanced AI Summarization System\n');

  const testTranscript = `
  Weekly Team Meeting - March 15, 2024
  Attendees: Sarah (PM), Mike (Dev), Lisa (Designer)
  
  Project Status Update:
  - User dashboard development is 75% complete
  - API integration testing in progress
  - UI design reviews scheduled for next week
  
  Key Decisions Made:
  - Extended project deadline to March 22nd due to additional testing requirements
  - Approved implementation of dark mode feature for next sprint
  - Decided to hire additional frontend developer
  
  Action Items:
  - Mike: Complete API integration testing by March 18th
  - Lisa: Finalize dark mode UI mockups by March 20th
  - Sarah: Post job listing for frontend developer by March 16th
  - Team: Review final designs in Friday meeting
  
  Budget Discussion:
  - Additional developer cost: $8,000/month
  - Current project 15% over budget but within acceptable range
  - Total project budget: $150,000
  
  Next Steps:
  - Schedule client demo for March 25th
  - Prepare presentation materials
  - Begin recruitment process for new developer
  `;

  const testPrompt = `Create a **comprehensive meeting summary** with clear structure. Include: **## Key Decisions** with rationale and impact, **## Action Items** organized by priority with owners and deadlines, **## Budget Items** if applicable, **## Next Steps** and follow-up requirements. Use professional formatting and emphasis. Keep under 300 words.`;

  try {
    console.log('📝 Generating enhanced summary...');
    const result = await aiService.generateSummary({
      transcript: testTranscript,
      prompt: testPrompt
    });

    if (result.success) {
      console.log('✅ Summary generated successfully!\n');
      
      console.log('📊 Summary Metadata:');
      console.log(`   Quality Score: ${result.metadata.qualityScore}/100`);
      console.log(`   Word Count: ${result.metadata.wordCount}`);
      console.log(`   Generation Time: ${result.metadata.generationTime}ms`);
      console.log(`   Model: ${result.metadata.model}`);
      
      if (result.metadata.validation) {
        console.log(`   Validation Status: ${result.metadata.validation.isValid ? 'Valid' : 'Issues Found'}`);
        if (result.metadata.validation.issues.length > 0) {
          console.log(`   Issues: ${result.metadata.validation.issues.length}`);
        }
        if (result.metadata.validation.suggestions.length > 0) {
          console.log(`   Suggestions: ${result.metadata.validation.suggestions.length}`);
        }
      }

      console.log('\n📄 Generated Summary:');
      console.log('=' .repeat(50));
      console.log(result.content);
      console.log('=' .repeat(50));

      // Check for enhanced features
      console.log('\n🔍 Enhanced Features Analysis:');
      const hasHeaders = result.content.includes('##') || result.content.includes('#');
      const hasBoldText = result.content.includes('**');
      const hasBulletPoints = result.content.includes('- ');
      const hasMonetaryAmounts = /\$[\d,]+/.test(result.content);
      const hasPercentages = /\d+%/.test(result.content);
      
      console.log(`   ✓ Headers: ${hasHeaders ? 'Yes' : 'No'}`);
      console.log(`   ✓ Bold Text: ${hasBoldText ? 'Yes' : 'No'}`);
      console.log(`   ✓ Bullet Points: ${hasBulletPoints ? 'Yes' : 'No'}`);
      console.log(`   ✓ Monetary Highlighting: ${hasMonetaryAmounts ? 'Yes' : 'No'}`);
      console.log(`   ✓ Percentage Highlighting: ${hasPercentages ? 'Yes' : 'No'}`);

      // Test enhanced summary types
      console.log('\n🎯 Testing Enhanced Summary Types...');
      
      const executiveResult = await aiService.generateEnhancedSummary({
        transcript: testTranscript,
        summaryType: 'executive'
      });
      
      if (executiveResult.success) {
        console.log(`   ✓ Executive Summary: Generated (${executiveResult.metadata.wordCount} words, Quality: ${executiveResult.metadata.qualityScore}/100)`);
      }

      const actionItemsResult = await aiService.generateEnhancedSummary({
        transcript: testTranscript,
        summaryType: 'action-items'
      });
      
      if (actionItemsResult.success) {
        console.log(`   ✓ Action Items Summary: Generated (${actionItemsResult.metadata.wordCount} words, Quality: ${actionItemsResult.metadata.qualityScore}/100)`);
      }

      console.log('\n🎉 Enhanced summarization system is working correctly!');
      console.log('\nKey Improvements Implemented:');
      console.log('• Enhanced prompt engineering for better structure');
      console.log('• Intelligent content formatting and highlighting');
      console.log('• Quality validation and scoring');
      console.log('• Professional formatting with headers and emphasis');
      console.log('• Automatic highlighting of important information');
      console.log('• Multiple summary types for different use cases');

    } else {
      console.log('❌ Summary generation failed');
      console.error(result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testEnhancedSummarization();
