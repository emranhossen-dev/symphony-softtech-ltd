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
