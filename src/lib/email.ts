import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface AdmissionEmailData {
  to: string;
  fullName: string;
  courseName: string;
  email: string;
  password: string;
  loginUrl?: string;
}

interface EnrollmentConfirmationEmailData {
  to: string;
  fullName: string;
  courseName: string;
  email: string;
  phone: string;
  enrollmentId: string;
  status: string;
  loginUrl?: string;
}

interface RejectionEmailData {
  to: string;
  fullName: string;
  courseName: string;
  email: string;
  enrollmentId: string;
  rejectionReason?: string;
  loginUrl?: string;
}

interface StatusChangeEmailData {
  to: string;
  fullName: string;
  courseName: string;
  email: string;
  enrollmentId: string;
  oldStatus: string;
  newStatus: string;
  additionalInfo?: string;
  loginUrl?: string;
}

// Create transporter
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // false for 587, true for 465
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransport(config);
};

// Send enrollment confirmation email
export async function sendEnrollmentConfirmationEmail(data: EnrollmentConfirmationEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const loginUrl = data.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Symphony Institute of Technology" <noreply@symphony.edu>',
      to: data.to,
      subject: `📝 Enrollment Confirmation - ${data.courseName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Enrollment Confirmation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .welcome {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .enrollment-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .enrollment-info h3 {
              margin: 0 0 10px 0;
              color: #667eea;
            }
            .status-info {
              background: #e8f5e9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #4caf50;
            }
            .status-info h3 {
              margin: 0 0 15px 0;
              color: #2e7d32;
            }
            .next-steps {
              background: #fff3e0;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #ff9800;
            }
            .next-steps h3 {
              margin: 0 0 10px 0;
              color: #e65100;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Symphony Institute of Technology</h1>
            </div>
          </div>
          
          <div class="content">
            <div class="welcome">
              <h2>Dear ${data.fullName},</h2>
              <p>Thank you for your interest in our institute! We have <strong>successfully received</strong> your enrollment application.</p>
            </div>

            <div class="enrollment-info">
              <h3>📚 Enrollment Details</h3>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Enrollment ID:</strong> ${data.enrollmentId}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone}</p>
            </div>

            <div class="status-info">
              <h3>📋 Application Status</h3>
              <p><strong>Current Status:</strong> ${data.status}</p>
              <p>Your application is now under review. We will process your application and notify you of the outcome within 2-3 business days.</p>
            </div>

            <div class="next-steps">
              <h3>🔄 What's Next?</h3>
              <ul>
                <li>Our team will review your application</li>
                <li>You will receive an email with the admission decision</li>
                <li>If admitted, you'll receive login credentials via email</li>
                <li>For any queries, please contact our support team</li>
              </ul>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} Symphony Institute of Technology. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Enrollment confirmation email sent successfully:', info.messageId);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending enrollment confirmation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send enrollment confirmation email' 
    };
  }
}

// Send rejection email
export async function sendRejectionEmail(data: RejectionEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Symphony Institute of Technology" <noreply@symphony.edu>',
      to: data.to,
      subject: `📋 Application Status Update - ${data.courseName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .welcome {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .rejection-info {
              background: #ffebee;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #f44336;
            }
            .rejection-info h3 {
              margin: 0 0 15px 0;
              color: #c62828;
            }
            .enrollment-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .enrollment-info h3 {
              margin: 0 0 10px 0;
              color: #667eea;
            }
            .next-steps {
              background: #e8f5e9;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #4caf50;
            }
            .next-steps h3 {
              margin: 0 0 10px 0;
              color: #2e7d32;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Symphony Institute of Technology</h1>
            </div>
          </div>
          
          <div class="content">
            <div class="welcome">
              <h2>Dear ${data.fullName},</h2>
              <p>Thank you for your interest in our institute. After careful consideration of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
            </div>

            <div class="rejection-info">
              <h3>📋 Application Decision</h3>
              <p><strong>Status:</strong> Not Selected</p>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Enrollment ID:</strong> ${data.enrollmentId}</p>
              ${data.rejectionReason ? `<p><strong>Reason:</strong> ${data.rejectionReason}</p>` : ''}
            </div>

            <div class="next-steps">
              <h3>🔄 What Can You Do?</h3>
              <ul>
                <li>You may apply again in the next batch/session</li>
                <li>Consider exploring other courses we offer</li>
                <li>Contact our admissions office for feedback on your application</li>
                <li>Check our website for upcoming courses and programs</li>
              </ul>
            </div>

            <div class="enrollment-info">
              <h3>📞 Contact Information</h3>
              <p>If you have any questions or need clarification, please feel free to contact our admissions team:</p>
              <p>📧 Email: admissions@symphony.edu</p>
              <p>📞 Phone: +880 1234-567890</p>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} Symphony Institute of Technology. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully:', info.messageId);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send rejection email' 
    };
  }
}

// Send general status change email
export async function sendStatusChangeEmail(data: StatusChangeEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const getStatusMessage = (status: string) => {
      switch (status) {
        case 'ADMITTED':
          return 'Congratulations! You have been admitted to our institute.';
        case 'REJECTED':
          return 'After careful consideration, we are unable to offer you admission at this time.';
        case 'WAITING':
          return 'Your application is on the waiting list. We will notify you if a spot becomes available.';
        case 'NEXT_BATCH':
          return 'Your application has been approved for the next batch. We will contact you with details soon.';
        default:
          return 'Your application status has been updated.';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'ADMITTED':
          return '#4caf50';
        case 'REJECTED':
          return '#f44336';
        case 'WAITING':
          return '#ff9800';
        case 'NEXT_BATCH':
          return '#2196f3';
        default:
          return '#667eea';
      }
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Symphony Institute of Technology" <noreply@symphony.edu>',
      to: data.to,
      subject: `📋 Application Status Update - ${data.courseName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .welcome {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .status-info {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid ${getStatusColor(data.newStatus)};
            }
            .status-info h3 {
              margin: 0 0 15px 0;
              color: ${getStatusColor(data.newStatus)};
            }
            .enrollment-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .enrollment-info h3 {
              margin: 0 0 10px 0;
              color: #667eea;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Symphony Institute of Technology</h1>
            </div>
          </div>
          
          <div class="content">
            <div class="welcome">
              <h2>Dear ${data.fullName},</h2>
              <p>Your application status has been updated. Here are the details:</p>
            </div>

            <div class="status-info">
              <h3>📋 Status Update</h3>
              <p><strong>Previous Status:</strong> ${data.oldStatus}</p>
              <p><strong>New Status:</strong> ${data.newStatus}</p>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Enrollment ID:</strong> ${data.enrollmentId}</p>
              <p><strong>Message:</strong> ${getStatusMessage(data.newStatus)}</p>
              ${data.additionalInfo ? `<p><strong>Additional Information:</strong> ${data.additionalInfo}</p>` : ''}
            </div>

            <div class="enrollment-info">
              <h3>📞 Contact Information</h3>
              <p>If you have any questions or need clarification, please feel free to contact our admissions team:</p>
              <p>📧 Email: admissions@symphony.edu</p>
              <p>📞 Phone: +880 1234-567890</p>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} Symphony Institute of Technology. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Status change email sent successfully:', info.messageId);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending status change email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send status change email' 
    };
  }
}

// Send admission email with password
export async function sendAdmissionEmail(data: AdmissionEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const loginUrl = data.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Symphony Institute of Technology" <noreply@symphony.edu>',
      to: data.to,
      subject: `🎉 Congratulations! You have been admitted to ${data.courseName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admission Confirmation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .welcome {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .course-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .course-info h3 {
              margin: 0 0 10px 0;
              color: #667eea;
            }
            .credentials {
              background: #e8f5e9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #4caf50;
            }
            .credentials h3 {
              margin: 0 0 15px 0;
              color: #2e7d32;
            }
            .credential-item {
              margin: 10px 0;
              padding: 10px;
              background: white;
              border-radius: 5px;
            }
            .credential-label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
            }
            .credential-value {
              font-size: 16px;
              color: #333;
              font-family: 'Courier New', monospace;
              letter-spacing: 1px;
            }
            .login-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .important {
              background: #fff3e0;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #ff9800;
            }
            .important h3 {
              margin: 0 0 10px 0;
              color: #e65100;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Symphony Institute of Technology</h1>
            </div>
          </div>
          
          <div class="content">
            <div class="welcome">
              <h2>Dear ${data.fullName},</h2>
              <p>Congratulations! We are thrilled to inform you that you have been <strong>successfully admitted</strong> to our institute.</p>
            </div>

            <div class="course-info">
              <h3>📚 Course Details</h3>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Status:</strong> Admitted</p>
            </div>

            <div class="credentials">
              <h3>🔐 Your Login Credentials</h3>
              <div class="credential-item">
                <div class="credential-label">Email Address</div>
                <div class="credential-value">${data.email}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">Temporary Password</div>
                <div class="credential-value">${data.password}</div>
              </div>
            </div>

            <div class="important">
              <h3>⚠️ Important Instructions</h3>
              <ul>
                <li>Please login using the credentials above</li>
                <li>Change your password immediately after first login</li>
                <li>Keep your credentials secure and do not share with anyone</li>
                <li>If you face any issues, contact our support team</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="login-button">Login to Your Account</a>
            </div>

            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} Symphony Institute of Technology. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// Test email configuration
export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true };
  } catch (error) {
    console.error('Email connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Email connection failed' 
    };
  }
}

interface HomeworkGradedEmailData {
  to: string;
  fullName: string;
  homeworkTitle: string;
  courseName: string;
  status: 'APPROVED' | 'REJECTED';
  marks: number | null;
  feedback: string | null;
}

export async function sendHomeworkGradedEmail(data: HomeworkGradedEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();
    const isApproved = data.status === 'APPROVED';

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Symphony Institute of Technology" <noreply@symphony.edu>',
      to: data.to,
      subject: isApproved 
        ? `🎉 Homework Approved: ${data.homeworkTitle}` 
        : `❌ Homework Needs Revision: ${data.homeworkTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Homework Evaluation Results</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #1a1f4c 0%, #0d1b3e 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
              border: 1px solid #e2e8f0;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: white;
            }
            .welcome {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .result-card {
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'};
              background: ${isApproved ? '#f0fdf4' : '#fef2f2'};
            }
            .result-card h3 {
              margin: 0 0 10px 0;
              color: ${isApproved ? '#047857' : '#b91c1c'};
              font-size: 18px;
            }
            .details-list {
              margin: 15px 0;
              padding: 0;
              list-style: none;
            }
            .details-list li {
              margin-bottom: 8px;
            }
            .details-list strong {
              color: #4a5568;
            }
            .feedback-box {
              background: #f7fafc;
              border: 1px solid #edf2f7;
              padding: 15px;
              border-radius: 6px;
              margin-top: 15px;
              font-style: italic;
              color: #4a5568;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #edf2f7;
              color: #718096;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Symphony Institute of Technology</h1>
            </div>
          </div>
          
          <div class="content">
            <div class="welcome">
              <p>Dear <strong>${data.fullName}</strong>,</p>
              <p>Your mentor has reviewed your homework submission for the course <strong>${data.courseName}</strong>.</p>
            </div>

            <div class="result-card">
              <h3>${isApproved ? '🎉 Homework Approved!' : '❌ Homework Revision Required'}</h3>
              <ul class="details-list">
                <li><strong>Assignment:</strong> ${data.homeworkTitle}</li>
                <li><strong>Status:</strong> ${isApproved ? 'Approved' : 'Needs Revision / Rejected'}</li>
                ${data.marks !== null ? `<li><strong>Marks Awarded:</strong> <span style="font-size: 16px; font-weight: bold; color: ${isApproved ? '#059669' : '#dc2626'}">${data.marks} / 100</span></li>` : ''}
              </ul>
              
              <div class="feedback-box">
                <strong>Mentor Feedback:</strong>
                <p style="margin: 5px 0 0 0;">${data.feedback || (isApproved ? 'Great job! Keep up the good work.' : 'Please review the comments and resubmit your assignment.')}</p>
              </div>
            </div>

            <p style="font-size: 14px; color: #4a5568;">You can view the full details and grades on your student learning platform.</p>

            <div class="footer">
              <p>This is an automated notification. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Symphony Institute of Technology. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Homework graded email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending homework graded email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send homework graded email'
    };
  }
}
