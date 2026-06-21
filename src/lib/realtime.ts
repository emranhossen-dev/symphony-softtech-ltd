/**
 * Send a real-time notification via WebSocket.
 * This is a shared implementation that was previously duplicated across
 * all notification trigger routes.
 */
export async function sendRealTimeNotification(
  userId: string,
  notificationData: {
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const ws = new WebSocket('ws://localhost:3001/notifications');
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'NOTIFICATION',
          studentId: userId,
          data: notificationData,
        })
      );
    }
  } catch {
    // Silently fail - WebSocket may not be available in all environments
    console.log(`Sending notification to user ${userId}:`, notificationData);
  }
}
