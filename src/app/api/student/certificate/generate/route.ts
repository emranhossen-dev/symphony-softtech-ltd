import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCertificatePDF } from '@/lib/certificateGenerator';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (existingCertificate) {
      return NextResponse.json({
        success: true,
        certificate: {
          id: existingCertificate.id,
          certificateUrl: existingCertificate.certificateUrl,
          verificationId: existingCertificate.verificationId,
          issuedAt: existingCertificate.issuedAt
        }
      });
    }

    // Get course and user details
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Generate verification ID
    const verificationId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Generate certificate PDF
    const certificateBuffer = await generateCertificatePDF({
      studentName: user.name,
      courseTitle: course.title,
      completionDate: new Date().toLocaleDateString(),
      verificationId: verificationId
    });

    // Save certificate to file system (in a real app, you'd use cloud storage)
    const certificateFileName = `certificate-${user.id}-${courseId}-${Date.now()}.pdf`;
    const certificateUrl = `/certificates/${certificateFileName}`;

    // Save certificate record to database
    const certificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        courseId: courseId,
        certificateUrl: certificateUrl,
        verificationId: verificationId
      }
    });

    // In a real implementation, you would save the PDF file to storage
    // For now, we'll just return the certificate record
    console.log('Certificate PDF generated (simulated):', certificateFileName);

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        certificateUrl: certificate.certificateUrl,
        verificationId: certificate.verificationId,
        issuedAt: certificate.issuedAt
      }
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
