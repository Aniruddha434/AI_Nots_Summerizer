import nodemailer from 'nodemailer';
import Logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';
    this.initializeTransporter();
  }

  /**
   * Initialize the email transporter with Nodemailer
   */
  initializeTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      Logger.warn('EMAIL_USER or EMAIL_PASS not configured. Email service will not be available.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      Logger.info('Email service initialized with Nodemailer');
    } catch (error) {
      Logger.error('Failed to initialize email service', error);
    }
  }

  /**
   * Send summary via email
   * @param {Object} params - Email parameters
   * @param {string} params.summaryContent - The summary content to send
   * @param {Array<string>} params.recipients - Array of recipient email addresses
   * @param {string} params.subject - Email subject (optional)
   * @param {string} params.message - Additional message (optional)
   * @param {Object} params.summaryMetadata - Summary metadata for context
   * @returns {Promise<Object>} - Send result
   */
  async sendSummary({ summaryContent, recipients, subject, message, summaryMetadata = {} }) {
    try {
      if (!this.transporter) {
        throw new Error('Email service is not configured. Please check EMAIL_USER and EMAIL_PASS.');
      }

      // Validate inputs
      if (!summaryContent || typeof summaryContent !== 'string') {
        throw new Error('Valid summary content is required');
      }

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        throw new Error('At least one recipient email is required');
      }

      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }

      Logger.info('Sending summary email', {
        recipientCount: recipients.length,
        summaryLength: summaryContent.length,
        hasCustomSubject: !!subject,
        hasCustomMessage: !!message
      });

      // Prepare email content
      const emailSubject = subject || this.generateDefaultSubject(summaryMetadata);
      const emailHtml = this.generateEmailHtml({
        summaryContent,
        customMessage: message,
        metadata: summaryMetadata
      });
      const emailText = this.generateEmailText({
        summaryContent,
        customMessage: message,
        metadata: summaryMetadata
      });

      // Send email to all recipients
      const mailOptions = {
        from: {
          name: 'AI Meeting Notes Summarizer',
          address: this.fromEmail
        },
        to: recipients,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        // Add headers for better deliverability
        headers: {
          'X-Mailer': 'AI Meeting Notes Summarizer v1.0',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Reply-To': this.fromEmail,
          'Return-Path': this.fromEmail
        },
        // Add message tracking
        messageId: `<${Date.now()}.${Math.random().toString(36).substring(7)}@gmail.com>`
      };

      const result = await this.transporter.sendMail(mailOptions);

      Logger.info('Summary email sent successfully', {
        messageId: result.messageId,
        recipients: recipients.length,
        accepted: result.accepted?.length || 0,
        rejected: result.rejected?.length || 0
      });

      return {
        success: true,
        messageId: result.messageId,
        recipients: recipients.length,
        accepted: result.accepted || [],
        rejected: result.rejected || [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      Logger.error('Failed to send summary email', {
        error: error.message,
        recipients: recipients?.length || 0
      });

      // Handle specific email service errors
      if (error.message.includes('authentication') || error.message.includes('API key')) {
        throw new Error('Email service authentication failed. Please check configuration.');
      }

      if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('Email service quota exceeded. Please try again later.');
      }

      if (error.message.includes('Invalid email')) {
        throw error; // Re-throw validation errors as-is
      }

      throw new Error('Failed to send email. Please try again later.');
    }
  }

  /**
   * Generate default email subject
   * @param {Object} metadata - Summary metadata
   * @returns {string} - Generated subject
   */
  generateDefaultSubject(metadata = {}) {
    const filename = metadata.originalFilename || 'Meeting';
    return `Summary: ${filename}`;
  }

  /**
   * Convert markdown-style text to HTML
   * @param {string} text - Markdown text
   * @returns {string} - HTML formatted text
   */
  convertMarkdownToHtml(text) {
    if (!text) return '';

    let html = text;

    // First, protect existing HTML-like content by temporarily replacing it
    const protectedContent = [];
    html = html.replace(/<[^>]+>/g, (match) => {
      protectedContent.push(match);
      return `__PROTECTED_${protectedContent.length - 1}__`;
    });

    // Convert headers (must be at start of line with space after #)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Convert bold text (**text** -> <strong>text</strong>) - more precise matching
    html = html.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');

    // Convert italic text (*text* -> <em>text</em>) - avoid conflicts with bold
    html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');

    // Process lists line by line to avoid issues
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;
    let listType = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for bullet points
      if (line.match(/^- .+/)) {
        if (!inList || listType !== 'ul') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        processedLines.push(`<li>${line.substring(2).trim()}</li>`);
      }
      // Check for numbered lists
      else if (line.match(/^\d+\.\s+.+/)) {
        if (!inList || listType !== 'ol') {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        processedLines.push(`<li>${line.replace(/^\d+\.\s+/, '')}</li>`);
      }
      // Regular line
      else {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        processedLines.push(line);
      }
    }

    // Close any remaining list
    if (inList) {
      processedLines.push(`</${listType}>`);
    }

    html = processedLines.join('\n');

    // Convert line breaks to <br> but avoid breaking block elements
    html = html.replace(/\n(?!<\/?(h[1-6]|ul|ol|li))/g, '<br>\n');

    // Clean up extra <br> tags around block elements
    html = html.replace(/<br>\s*(<h[1-6]>)/g, '\n$1');
    html = html.replace(/(<\/h[1-6]>)\s*<br>/g, '$1\n');
    html = html.replace(/<br>\s*(<ul>|<ol>)/g, '\n$1');
    html = html.replace(/(<\/ul>|<\/ol>)\s*<br>/g, '$1\n');
    html = html.replace(/<br>\s*(<li>)/g, '\n$1');
    html = html.replace(/(<\/li>)\s*<br>/g, '$1\n');

    // Restore protected content
    protectedContent.forEach((content, index) => {
      html = html.replace(`__PROTECTED_${index}__`, content);
    });

    return html;
  }

  /**
   * Generate HTML email content
   * @param {Object} params - Email content parameters
   * @returns {string} - HTML email content
   */
  generateEmailHtml({ summaryContent, customMessage, metadata = {} }) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const filename = metadata.originalFilename || 'Meeting Notes';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Summary - ${filename}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header .meta {
            color: #6c757d;
            font-size: 14px;
        }
        .custom-message {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .content {
            font-size: 16px;
            line-height: 1.7;
            color: #2c3e50;
        }
        .content h1, .content h2, .content h3 {
            color: #2c3e50;
            margin: 20px 0 10px 0;
            font-weight: 600;
        }
        .content h1 { font-size: 24px; }
        .content h2 { font-size: 20px; }
        .content h3 { font-size: 18px; }
        .content ul, .content ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        .content li {
            margin: 5px 0;
            line-height: 1.6;
        }
        .content strong {
            font-weight: 600;
            color: #1a202c;
        }
        .content em {
            font-style: italic;
            color: #4a5568;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 12px;
            color: #6c757d;
            text-align: center;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 Meeting Summary</h1>
            <div class="meta">
                <strong>Document:</strong> ${filename}<br>
                <strong>Generated:</strong> ${date} at ${time}
                ${metadata.aiModel ? `<br><strong>AI Model:</strong> ${metadata.aiModel}` : ''}
                ${metadata.wordCount ? `<br><strong>Word Count:</strong> ${metadata.wordCount}` : ''}
            </div>
        </div>

        ${customMessage ? `<div class="custom-message">
            <strong>📨 Message:</strong><br>
            ${this.convertMarkdownToHtml(customMessage)}
        </div>` : ''}

        <div class="content">${this.convertMarkdownToHtml(summaryContent)}</div>

        <div class="footer">
            <p>This summary was generated by AI Meeting Notes Summarizer<br>
            <small>If you have any questions about this summary, please contact the sender.</small></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate plain text email content
   * @param {Object} params - Email content parameters
   * @returns {string} - Plain text email content
   */
  generateEmailText({ summaryContent, customMessage, metadata = {} }) {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const filename = metadata.originalFilename || 'Meeting Notes';

    let content = '';

    // Header
    content += '📝 MEETING SUMMARY\n';
    content += '=' + '='.repeat(50) + '\n\n';

    // Metadata
    content += `Document: ${filename}\n`;
    content += `Generated: ${date} at ${time}\n`;
    if (metadata.aiModel) {
      content += `AI Model: ${metadata.aiModel}\n`;
    }
    if (metadata.wordCount) {
      content += `Word Count: ${metadata.wordCount}\n`;
    }
    content += '\n';

    // Custom message
    if (customMessage) {
      content += '📨 MESSAGE:\n';
      content += '-'.repeat(20) + '\n';
      content += `${customMessage}\n\n`;
    }

    // Summary content
    content += '📄 SUMMARY:\n';
    content += '-'.repeat(20) + '\n';
    content += summaryContent;

    // Footer
    content += '\n\n' + '='.repeat(60) + '\n';
    content += 'This summary was generated by AI Meeting Notes Summarizer\n';
    content += 'If you have any questions about this summary, please contact the sender.\n';

    return content;
  }

  /**
   * Test email service connection
   * @returns {Promise<boolean>} - True if service is working
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      Logger.info('Email service connection test successful');
      return true;
    } catch (error) {
      Logger.error('Email service connection test failed', error);
      return false;
    }
  }

  /**
   * Get service status and configuration
   * @returns {Object} - Service status information
   */
  getStatus() {
    return {
      service: 'Nodemailer SMTP',
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      fromEmail: this.fromEmail,
      transporterReady: !!this.transporter,
      timestamp: new Date().toISOString()
    };
  }
}

// Create and export a singleton instance
const emailService = new EmailService();

export default emailService;
