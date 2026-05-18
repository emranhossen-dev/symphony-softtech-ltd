import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/security';

// Public certificate verification
export async function GET(request: NextRequest, { params }: { params: Promise<{ verificationId: string }> }) {
  try {
    const { verificationId } = await params;

    // Mock certificate data - in real app, fetch from database
    const certificate = {
      id: '1',
      studentName: 'John Doe',
      courseName: 'Web Development Fundamentals',
      completionDate: '2024-01-15T10:00:00Z',
      instructorName: 'John Smith',
      duration: '8 weeks',
      grade: 'A',
      verificationId: verificationId,
      certificateUrl: `/certificates/verify/${verificationId}`,
      pdfUrl: `/certificates/download/${verificationId}.pdf`,
      isDownloaded: true,
      createdAt: '2024-01-15T10:00:00Z',
      isValid: true
    };

    // Verify the certificate ID format and existence
    if (!verificationId || !verificationId.startsWith('CERT-')) {
      return NextResponse.json(
        { error: 'Invalid verification ID format' },
        { status: 400 }
      );
    }

    // In real app, you would verify against the database
    // For this example, we'll check if the ID matches our mock data
    const isValidCertificate = verificationId === certificate.verificationId;

    if (!isValidCertificate) {
      return NextResponse.json(
        { 
          error: 'Certificate not found or invalid',
          verificationId,
          isValid: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate,
      verificationId,
      isValid: true,
      message: 'Certificate verified successfully'
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { error: 'Failed to verify certificate' },
      { status: 500 }
    );
  }
}

// Certificate verification page
export async function GET_page(request: NextRequest, { params }: { params: Promise<{ verificationId: string }> }) {
  try {
    const { verificationId } = await params;

    // Mock certificate data - in real app, fetch from database
    const certificate = {
      id: '1',
      studentName: 'John Doe',
      courseName: 'Web Development Fundamentals',
      completionDate: '2024-01-15T10:00:00Z',
      instructorName: 'John Smith',
      duration: '8 weeks',
      grade: 'A',
      verificationId: verificationId,
      certificateUrl: `/certificates/verify/${verificationId}`,
      pdfUrl: `/certificates/download/${verificationId}.pdf`,
      isDownloaded: true,
      createdAt: '2024-01-15T10:00:00Z',
      isValid: true
    };

    // Verify the certificate ID format and existence
    if (!verificationId || !verificationId.startsWith('CERT-')) {
      return new NextResponse(`
        <html>
          <head>
            <title>Certificate Not Found</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                margin: 0; 
                background: #f8f9fa; 
                color: #333; 
              }
              .error-container { 
                text-align: center; 
                padding: 40px; 
                background: white; 
                border-radius: 8px; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                max-width: 500px; 
              }
              .error-icon { 
                font-size: 48px; 
                color: #dc3545; 
                margin-bottom: 20px; 
              }
              .error-title { 
                font-size: 24px; 
                color: #dc3545; 
                margin-bottom: 10px; 
                font-weight: bold; 
              }
              .error-message { 
                font-size: 16px; 
                color: #666; 
                margin-bottom: 20px; 
              }
              .error-code { 
                background: #f8f9fa; 
                padding: 10px; 
                border-radius: 4px; 
                font-family: monospace; 
                font-size: 14px; 
                color: #666; 
              }
            </style>
          </head>
          <body>
            <div class="error-container">
              <div class="error-icon">⚠️</div>
              <div class="error-title">Certificate Not Found</div>
              <div class="error-message">
                The certificate you're looking for could not be found or the verification ID is invalid.
              </div>
              <div class="error-code">
                Error Code: CERT_NOT_FOUND
              </div>
            </div>
          </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Return HTML page for valid certificate
    return new NextResponse(`
      <html>
        <head>
          <title>Certificate Verification - ${certificate.studentName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta property="og:title" content="Certificate Verification">
          <meta property="og:description" content="Verify the authenticity of ${certificate.studentName}'s certificate">
          <meta property="og:image" content="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/og/certificate/${verificationId}">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              min-height: 100vh; 
              color: #333; 
            }
            .verification-container { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px; 
            }
            .verification-card { 
              background: white; 
              border-radius: 12px; 
              box-shadow: 0 8px 32px rgba(0,0,0,0.1); 
              overflow: hidden; 
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
            }
            .success-icon { 
              font-size: 48px; 
              margin-bottom: 10px; 
            }
            .success-title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 5px; 
            }
            .certificate { 
              border: 2px solid #gold; 
              border-radius: 8px; 
              padding: 30px; 
              background: #fff9e6; 
              margin: 20px 0; 
              text-align: center; 
            }
            .certificate-header { 
              font-size: 20px; 
              color: #2c3e50; 
              margin-bottom: 15px; 
              font-weight: bold; 
            }
            .certificate-content { 
              text-align: left; 
              margin-bottom: 20px; 
            }
            .field { 
              margin-bottom: 10px; 
              font-size: 16px; 
            }
            .label { 
              font-weight: bold; 
              color: #2c3e50; 
              display: inline-block; 
              width: 120px; 
            }
            .value { 
              color: #34495e; 
            }
            .verification-id { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 6px; 
              font-family: monospace; 
              font-weight: bold; 
              font-size: 18px; 
              color: #28a745; 
              text-align: center; 
              margin-top: 20px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e0e0e0; 
              font-size: 14px; 
              color: #666; 
            }
            .verified-badge { 
              display: inline-block; 
              background: #28a745; 
              color: white; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold; 
              margin-left: 10px; 
            }
            @media (max-width: 768px) {
              .verification-container { 
                padding: 20px 10px; 
              }
              .certificate { 
                margin: 10px 0; 
              }
              .field { 
                font-size: 14px; 
              }
              .label { 
                width: 100px; 
                font-size: 14px; 
              }
            }
          </style>
        </head>
        <body>
          <div class="verification-container">
            <div class="verification-card">
              <div class="header">
                <div class="success-icon">✓</div>
                <div class="success-title">Certificate Verified</div>
              </div>
              
              <div class="certificate">
                <div class="certificate-header">
                  Certificate of Completion
                </div>
                
                <div class="certificate-content">
                  <div class="field">
                    <span class="label">Student Name:</span>
                    <span class="value">${certificate.studentName}</span>
                  </div>
                  <div class="field">
                    <span class="label">Course Name:</span>
                    <span class="value">${certificate.courseName}</span>
                  </div>
                  <div class="field">
                    <span class="label">Completion Date:</span>
                    <span class="value">${new Date(certificate.completionDate).toLocaleDateString()}</span>
                  </div>
                  <div class="field">
                    <span class="label">Instructor:</span>
                    <span class="value">${certificate.instructorName}</span>
                  </div>
                  <div class="field">
                    <span class="label">Duration:</span>
                    <span class="value">${certificate.duration}</span>
                  </div>
                  <div class="field">
                    <span class="label">Grade:</span>
                    <span class="value">${certificate.grade}</span>
                  </div>
                </div>
                
                <div class="verification-id">
                  Verification ID: ${certificate.verificationId}
                  <span class="verified-badge">VERIFIED</span>
                </div>
              </div>
              
              <div class="footer">
                <p>This certificate was issued by Symphony Training Centre</p>
                <p>Generated on ${new Date(certificate.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return new NextResponse(`
      <html>
        <head>
          <title>Verification Error</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              margin: 0; 
              background: #f8f9fa; 
              color: #333; 
            }
            .error-container { 
              text-align: center; 
              padding: 40px; 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
              max-width: 500px; 
            }
            .error-icon { 
              font-size: 48px; 
              color: #dc3545; 
              margin-bottom: 20px; 
            }
            .error-title { 
              font-size: 24px; 
              color: #dc3545; 
              margin-bottom: 10px; 
              font-weight: bold; 
            }
            .error-message { 
              font-size: 16px; 
              color: #666; 
              margin-bottom: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="error-icon">⚠️</div>
            <div class="error-title">Verification Error</div>
            <div class="error-message">
              An error occurred while verifying the certificate. Please try again later.
            </div>
          </div>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
