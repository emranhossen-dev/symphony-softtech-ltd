import { prisma } from '@/lib/prisma';

export type NotificationType = 
  | 'ENROLLMENT_APPROVED'
  | 'HOMEWORK_APPROVED'
  | 'HOMEWORK_REJECTED'
  | 'MODULE_UNLOCKED'
  | 'ATTENDANCE_MARKED'
  | 'COURSE_COMPLETED'
  | 'CERTIFICATE_AVAILABLE';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {}
      }
    });

    console.log('Notification created:', notification.id);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Specific notification creators
export async function createEnrollmentApprovedNotification(userId: string, courseTitle: string, courseId: string) {
  return createNotification({
    userId,
    type: 'ENROLLMENT_APPROVED',
    title: 'Enrollment Approved',
    message: `Your enrollment for "${courseTitle}" has been approved. You can now start learning!`,
    metadata: { courseId, courseTitle }
  });
}

export async function createHomeworkApprovedNotification(userId: string, moduleTitle: string, moduleId: string, courseId: string) {
  return createNotification({
    userId,
    type: 'HOMEWORK_APPROVED',
    title: 'Homework Approved',
    message: `Great job! Your homework for "${moduleTitle}" has been approved.`,
    metadata: { moduleId, moduleTitle, courseId }
  });
}

export async function createHomeworkRejectedNotification(userId: string, moduleTitle: string, feedback: string, moduleId: string, courseId: string) {
  return createNotification({
    userId,
    type: 'HOMEWORK_REJECTED',
    title: 'Homework Needs Revision',
    message: `Your homework for "${moduleTitle}" needs revision. Please check the feedback.`,
    metadata: { moduleId, moduleTitle, courseId, feedback }
  });
}

export async function createModuleUnlockedNotification(userId: string, moduleTitle: string, moduleId: string, courseId: string) {
  return createNotification({
    userId,
    type: 'MODULE_UNLOCKED',
    title: 'New Module Unlocked',
    message: `Congratulations! "${moduleTitle}" is now available for you to study.`,
    metadata: { moduleId, moduleTitle, courseId }
  });
}

export async function createAttendanceMarkedNotification(userId: string, status: 'PRESENT' | 'ABSENT', sessionDate: string, courseId: string) {
  const statusText = status === 'PRESENT' ? 'marked as present' : 'marked as absent';
  return createNotification({
    userId,
    type: 'ATTENDANCE_MARKED',
    title: 'Attendance Updated',
    message: `Your attendance for ${sessionDate} has been ${statusText}.`,
    metadata: { status, sessionDate, courseId }
  });
}

export async function createCourseCompletedNotification(userId: string, courseTitle: string, courseId: string) {
  return createNotification({
    userId,
    type: 'COURSE_COMPLETED',
    title: 'Course Completed!',
    message: `Congratulations! You have completed all modules for "${courseTitle}".`,
    metadata: { courseId, courseTitle }
  });
}

export async function createCertificateAvailableNotification(userId: string, courseTitle: string, courseId: string, certificateId: string) {
  return createNotification({
    userId,
    type: 'CERTIFICATE_AVAILABLE',
    title: 'Certificate Available',
    message: `Your certificate for "${courseTitle}" is ready for download!`,
    metadata: { courseId, courseTitle, certificateId }
  });
}
