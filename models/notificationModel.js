const createNotification = (notificationData, attendeeId) => {
    return {
        attendeeId,
        sessionId: notificationData.sessionId,
        title: notificationData.title,
        message: notificationData.message,
        type: "session_reminder",
        isRead: false,
        isSent: false,
        scheduledFor: notificationData.scheduledFor,
        createdAt: new Date()
    };
};

module.exports = createNotification;