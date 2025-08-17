/**
 * Comprehensive test suite for enhanced AI summarization system
 * Tests improved prompt engineering, formatting, quality validation, and content structure
 */

import dotenv from 'dotenv';
import aiService from './services/ai.js';
import Logger from './utils/logger.js';

dotenv.config();

class SummarizationTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.totalTests = 0;
  }

  async runAllTests() {
    console.log('🚀 Starting Enhanced Summarization System Tests\n');
    
    try {
      await this.testBasicSummarization();
      await this.testFormattingEnhancements();
      await this.testQualityValidation();
      await this.testContentStructuring();
      await this.testEnhancedPrompts();
      await this.testSpecialContentHighlighting();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testBasicSummarization() {
    console.log('📝 Testing Basic Summarization...');
    
    const testTranscript = `
    Meeting: Weekly Team Standup
    Date: March 15, 2024
    Attendees: Sarah Johnson (PM), Mike Chen (Dev), Lisa Rodriguez (Designer)
    
    Sarah opened the meeting discussing the Q1 project status. The team is 75% complete with the new user dashboard.
    
    Key decisions made:
    - Decided to extend the deadline by one week to March 22nd due to additional testing requirements
    - Agreed to implement the dark mode feature in the next sprint
    - Concluded that we need to hire one additional frontend developer
    
    Action items:
    - Mike: Complete API integration testing by March 18th
    - Lisa: Finalize UI mockups for dark mode by March 20th  
    - Sarah: Post job listing for frontend developer by March 16th
    - Team: Review and approve final designs in Friday meeting
    
    Budget discussion: Additional developer will cost approximately $8,000/month. 
    Current project is 15% over budget but within acceptable range.
    
    Next steps: Schedule client demo for March 25th, prepare presentation materials.
    `;

    const testPrompt = "Create a comprehensive meeting summary with clear structure and formatting.";

    try {
      const result = await aiService.generateSummary({
        transcript: testTranscript,
        prompt: testPrompt
      });

      this.assert(result.success, 'Summary generation should succeed');
      this.assert(result.content.length > 50, 'Summary should have substantial content');
      this.assert(result.metadata.qualityScore > 60, 'Quality score should be reasonable');
      this.assert(result.metadata.wordCount > 20, 'Summary should have adequate word count');
      
      console.log('✅ Basic summarization test passed');
      console.log(`   Quality Score: ${result.metadata.qualityScore}/100`);
      console.log(`   Word Count: ${result.metadata.wordCount}`);
      console.log(`   Content Preview: ${result.content.substring(0, 100)}...\n`);
      
    } catch (error) {
      console.log('❌ Basic summarization test failed:', error.message);
    }
  }

  async testFormattingEnhancements() {
    console.log('🎨 Testing Formatting Enhancements...');
    
    const testTranscript = `
    Project Review Meeting - March 15, 2024
    
    We discussed the current project status. The development team reported 80% completion.
    
    Important decisions:
    - We decided to launch the beta version on April 1st
    - Marketing budget increased to $50,000 for Q2
    - Team agreed to implement user feedback system
    
    Action items:
    - John: Complete security audit by March 25th
    - Mary: Prepare marketing materials by March 30th
    - Team: Conduct final testing phase
    `;

    const testPrompt = "Create a well-structured summary with headers, bullet points, and emphasis on important information.";

    try {
      const result = await aiService.generateSummary({
        transcript: testTranscript,
        prompt: testPrompt
      });

      // Check for formatting elements
      const hasHeaders = result.content.includes('##') || result.content.includes('#');
      const hasBulletPoints = result.content.includes('- ');
      const hasBoldText = result.content.includes('**');
      const hasStructure = hasHeaders || hasBulletPoints;

      this.assert(hasStructure, 'Summary should have structural formatting');
      this.assert(result.metadata.qualityScore >= 70, 'Formatted summary should have higher quality score');
      
      console.log('✅ Formatting enhancements test passed');
      console.log(`   Has Headers: ${hasHeaders}`);
      console.log(`   Has Bullet Points: ${hasBulletPoints}`);
      console.log(`   Has Bold Text: ${hasBoldText}`);
      console.log(`   Quality Score: ${result.metadata.qualityScore}/100\n`);
      
    } catch (error) {
      console.log('❌ Formatting enhancements test failed:', error.message);
    }
  }

  async testQualityValidation() {
    console.log('🔍 Testing Quality Validation...');
    
    const goodTranscript = `
    Strategic Planning Meeting - March 15, 2024
    
    The executive team met to discuss Q2 strategy and budget allocation.
    
    Key decisions:
    - Approved $2M budget for new product development
    - Decided to expand into European markets by Q3
    - Agreed to hire 15 additional engineers
    
    Action items:
    - CFO: Finalize budget allocation by March 20th
    - VP Sales: Develop European expansion plan by April 1st
    - HR: Begin recruitment process immediately
    
    Risk assessment: Market volatility may impact timeline by 2-3 weeks.
    `;

    const poorTranscript = "Short meeting. Nothing important discussed.";

    try {
      // Test with good content
      const goodResult = await aiService.generateSummary({
        transcript: goodTranscript,
        prompt: "Create a comprehensive summary."
      });

      // Test with poor content
      const poorResult = await aiService.generateSummary({
        transcript: poorTranscript,
        prompt: "Create a comprehensive summary."
      });

      this.assert(goodResult.metadata.qualityScore > poorResult.metadata.qualityScore, 
                 'Good content should have higher quality score than poor content');
      this.assert(goodResult.metadata.validation, 'Validation metadata should be present');
      this.assert(typeof goodResult.metadata.validation.isValid === 'boolean', 'Validation should include isValid flag');
      
      console.log('✅ Quality validation test passed');
      console.log(`   Good Content Score: ${goodResult.metadata.qualityScore}/100`);
      console.log(`   Poor Content Score: ${poorResult.metadata.qualityScore}/100`);
      console.log(`   Validation Issues: ${goodResult.metadata.validation.issues.length}\n`);
      
    } catch (error) {
      console.log('❌ Quality validation test failed:', error.message);
    }
  }

  async testContentStructuring() {
    console.log('🏗️ Testing Content Structuring...');
    
    const structuredTranscript = `
    Product Launch Meeting - March 15, 2024
    
    We reviewed the upcoming product launch scheduled for April 15th.
    
    Marketing discussed the campaign strategy with a budget of $75,000.
    Development reported all features are complete and testing is 90% done.
    Sales team confirmed pre-orders of $250,000 already received.
    
    Decisions made:
    - Launch date confirmed for April 15th
    - Marketing budget approved at $75,000
    - Beta testing to continue until April 10th
    
    Action items:
    - Marketing: Launch advertising campaign by April 1st
    - Development: Complete final testing by April 10th
    - Sales: Prepare launch day logistics by April 12th
    
    Next steps: Final review meeting on April 13th.
    `;

    try {
      const result = await aiService.generateSummary({
        transcript: structuredTranscript,
        prompt: "Create a well-organized summary with clear sections."
      });

      // Check for intelligent structuring
      const hasDecisionSection = /decision/i.test(result.content);
      const hasActionSection = /action/i.test(result.content);
      const hasNextStepsSection = /next/i.test(result.content);
      const hasMonetaryHighlighting = /\$[\d,]+/.test(result.content);

      this.assert(hasDecisionSection, 'Summary should identify decisions');
      this.assert(hasActionSection, 'Summary should identify action items');
      this.assert(result.metadata.qualityScore >= 75, 'Structured content should have high quality score');
      
      console.log('✅ Content structuring test passed');
      console.log(`   Has Decision Section: ${hasDecisionSection}`);
      console.log(`   Has Action Section: ${hasActionSection}`);
      console.log(`   Has Next Steps: ${hasNextStepsSection}`);
      console.log(`   Has Monetary Highlighting: ${hasMonetaryHighlighting}\n`);
      
    } catch (error) {
      console.log('❌ Content structuring test failed:', error.message);
    }
  }

  async testEnhancedPrompts() {
    console.log('💡 Testing Enhanced Prompt Templates...');
    
    const testTranscript = `
    Executive Strategy Meeting - March 15, 2024
    
    The board discussed Q2 financial projections and strategic initiatives.
    Revenue target set at $5M with 20% growth expected.
    
    Key strategic decisions:
    - Approved acquisition of TechStart Inc for $2.5M
    - Decided to launch new product line in Q3
    - Agreed to expand team by 25 people
    
    Financial implications: Additional $500K investment required.
    Risk factors: Market competition increasing, timeline may be aggressive.
    
    Action items:
    - CEO: Finalize acquisition paperwork by March 30th
    - CFO: Secure additional funding by April 15th
    - VP Product: Develop Q3 launch strategy by April 1st
    `;

    try {
      const executiveResult = await aiService.generateEnhancedSummary({
        transcript: testTranscript,
        summaryType: 'executive'
      });

      const comprehensiveResult = await aiService.generateEnhancedSummary({
        transcript: testTranscript,
        summaryType: 'comprehensive'
      });

      this.assert(executiveResult.success, 'Executive summary should succeed');
      this.assert(comprehensiveResult.success, 'Comprehensive summary should succeed');
      this.assert(executiveResult.content !== comprehensiveResult.content, 'Different prompt types should produce different outputs');
      
      console.log('✅ Enhanced prompts test passed');
      console.log(`   Executive Summary Quality: ${executiveResult.metadata.qualityScore}/100`);
      console.log(`   Comprehensive Summary Quality: ${comprehensiveResult.metadata.qualityScore}/100\n`);
      
    } catch (error) {
      console.log('❌ Enhanced prompts test failed:', error.message);
    }
  }

  async testSpecialContentHighlighting() {
    console.log('🎯 Testing Special Content Highlighting...');
    
    const testTranscript = `
    Sales Review Meeting - March 15, 2024
    
    Q1 sales performance exceeded expectations with $1.2M in revenue (15% above target).
    
    Key metrics:
    - Conversion rate improved to 8.5%
    - Customer acquisition cost reduced by 12%
    - Average deal size increased to $45,000
    
    Action items:
    - Sales Manager: Prepare Q2 forecast by March 22nd
    - Marketing: Launch new campaign with $25,000 budget by April 1st
    - Customer Success: Implement new onboarding process by March 30th
    
    Next quarter target: $1.5M revenue with 20% growth.
    `;

    try {
      const result = await aiService.generateSummary({
        transcript: testTranscript,
        prompt: "Create a summary highlighting key metrics, financial data, and deadlines."
      });

      // Check for special content highlighting
      const hasMonetaryAmounts = /\$[\d,]+/.test(result.content);
      const hasPercentages = /\d+%/.test(result.content);
      const hasDateHighlighting = /march|april/i.test(result.content);

      this.assert(hasMonetaryAmounts, 'Summary should highlight monetary amounts');
      this.assert(hasPercentages, 'Summary should highlight percentages');
      this.assert(result.metadata.qualityScore >= 70, 'Content with special highlighting should have good quality');
      
      console.log('✅ Special content highlighting test passed');
      console.log(`   Has Monetary Amounts: ${hasMonetaryAmounts}`);
      console.log(`   Has Percentages: ${hasPercentages}`);
      console.log(`   Has Date References: ${hasDateHighlighting}\n`);
      
    } catch (error) {
      console.log('❌ Special content highlighting test failed:', error.message);
    }
  }

  assert(condition, message) {
    this.totalTests++;
    if (condition) {
      this.passedTests++;
      this.testResults.push({ status: 'PASS', message });
    } else {
      this.testResults.push({ status: 'FAIL', message });
      console.log(`   ❌ Assertion failed: ${message}`);
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 All tests passed! Enhanced summarization system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the implementation.');
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SummarizationTester();
  tester.runAllTests().catch(console.error);
}

export default SummarizationTester;
