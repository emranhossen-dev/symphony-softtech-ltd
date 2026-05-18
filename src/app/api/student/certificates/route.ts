import { NextRequest, NextResponse } from 'next/server';

// Get student certificates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { status, search } = {
      status: searchParams.get('status') || 'all',
      search: searchParams.get('search') || ''
    };

    // Mock data - in real app, fetch from database
    const certificates = [
      {
        id: '1',
        studentName: 'John Doe',
        courseName: 'Web Development Fundamentals',
        completionDate: '2024-01-15T10:00:00Z',
        instructorName: 'John Smith',
        duration: '8 weeks',
        grade: 'A',
        verificationId: 'CERT-2024-ABC123',
        certificateUrl: '/certificates/verify/CERT-2024-ABC123',
        pdfUrl: '/certificates/download/CERT-2024-ABC123.pdf',
        isDownloaded: true,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        studentName: 'John Doe',
        courseName: 'Advanced JavaScript',
        completionDate: '2024-01-20T14:30:00Z',
        instructorName: 'Jane Smith',
        duration: '6 weeks',
        grade: 'B+',
        verificationId: 'CERT-2024-DEF456',
        certificateUrl: '/certificates/verify/CERT-2024-DEF456',
        pdfUrl: '/certificates/download/CERT-2024-DEF456.pdf',
        isDownloaded: false,
        createdAt: '2024-01-20T14:30:00Z'
      }
    ];

    // Apply filters
    let filteredCertificates = certificates;
    
    if (status !== 'all') {
      filteredCertificates = filteredCertificates.filter(cert => 
        status === 'downloaded' ? cert.isDownloaded : !cert.isDownloaded
      );
    }
    
    if (search) {
      filteredCertificates = filteredCertificates.filter(cert =>
        cert.studentName.toLowerCase().includes(search.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      certificates: filteredCertificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

// Generate new certificate
export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Mock course data - in real app, fetch from database
    const course = {
      id: courseId,
      name: 'Web Development Fundamentals',
      description: 'Learn the basics of web development',
      duration: '8 weeks',
      instructor: 'John Smith',
      category: 'Web Development'
    };

    // Mock student data - in real app, get from auth
    const student = {
      id: 'student_123',
      name: 'John Doe',
      email: 'john@example.com'
    };

    // Generate unique verification ID
    const verificationId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create certificate record
    const certificate = {
      id: Date.now().toString(),
      studentName: student.name,
      courseName: course.name,
      completionDate: new Date().toISOString(),
      instructorName: course.instructor,
      duration: course.duration,
      grade: 'A', // In real app, calculate based on performance
      verificationId,
      certificateUrl: `/certificates/verify/${verificationId}`,
      pdfUrl: `/certificates/download/${verificationId}.pdf`,
      isDownloaded: false,
      createdAt: new Date().toISOString()
    };

    // In real app, save to database
    console.log('[CERTIFICATE GENERATED]', JSON.stringify(certificate));

    return NextResponse.json({
      success: true,
      certificate,
      message: 'Certificate generated successfully'
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
