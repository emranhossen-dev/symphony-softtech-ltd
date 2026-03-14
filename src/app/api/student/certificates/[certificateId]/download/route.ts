import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/security';

// Download certificate PDF
export async function GET(request: NextRequest, { params }: { params: Promise<{ certificateId: string }> }) {
  try {
    const { certificateId } = await params;

    // Mock certificate data - in real app, fetch from database
    const certificate = {
      id: certificateId,
      studentName: 'John Doe',
      courseName: 'Web Development Fundamentals',
      completionDate: '2024-01-15T10:00:00Z',
      instructorName: 'John Smith',
      duration: '8 weeks',
      grade: 'A',
      verificationId: 'CERT-2024-ABC123',
      createdAt: '2024-01-15T10:00:00Z'
    };

    // Generate PDF content (simplified version)
    const pdfContent = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5; 
            }
            .certificate { 
              background: white; 
              border: 2px solid #gold; 
              border-radius: 10px; 
              padding: 40px; 
              text-align: center; 
              max-width: 800px; 
              margin: 0 auto; 
              box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
            }
            .header { 
              margin-bottom: 30px; 
            }
            .title { 
              font-size: 32px; 
              color: #2c3e50; 
              margin-bottom: 10px; 
              font-weight: bold; 
            }
            .subtitle { 
              font-size: 18px; 
              color: #7f8c8d; 
              margin-bottom: 20px; 
            }
            .content { 
              text-align: left; 
              margin-bottom: 30px; 
            }
            .field { 
              margin-bottom: 15px; 
              font-size: 16px; 
            }
            .label { 
              font-weight: bold; 
              color: #2c3e50; 
              display: inline-block; 
              width: 150px; 
            }
            .value { 
              color: #34495e; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e0e0e0; 
              text-align: center; 
              font-size: 14px; 
              color: #7f8c8d; 
            }
            .verification-id { 
              background: #f8f9fa; 
              padding: 10px; 
              border-radius: 5px; 
              font-family: monospace; 
              font-weight: bold; 
            }
            @media print {
              body { padding: 0; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="title">Certificate of Completion</div>
              <div class="subtitle">This is to certify that</div>
            </div>
            
            <div class="content">
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
            
            <div class="footer">
              <div class="verification-id">
                Verification ID: ${certificate.verificationId}
              </div>
              <p>Verify this certificate at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/certificates/verify/${certificate.verificationId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // In a real application, you would use a PDF library like puppeteer or jsPDF
    // For this example, we'll return the HTML content that can be converted to PDF
    
    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="certificate-${certificateId}.html"`
      }
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return NextResponse.json(
      { error: 'Failed to download certificate' },
      { status: 500 }
    );
  }
}

// Mark certificate as downloaded
export async function POST(request: NextRequest, { params }: { params: Promise<{ certificateId: string }> }) {
  try {
    const { certificateId } = await params;

    // In real app, update database to mark as downloaded
    console.log(`[CERTIFICATE DOWNLOADED]`, `Certificate ${certificateId} downloaded`);

    return NextResponse.json({
      success: true,
      message: 'Certificate marked as downloaded'
    });
  } catch (error) {
    console.error('Error marking certificate as downloaded:', error);
    return NextResponse.json(
      { error: 'Failed to mark certificate as downloaded' },
      { status: 500 }
    );
  }
}
