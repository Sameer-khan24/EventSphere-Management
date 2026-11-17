const createSupportMessage = (messageData) => {
    return {
        senderId: messageData.senderId,
        senderRole: messageData.senderRole,
        receiverId: messageData.receiverId,
        subject: messageData.subject,
        message: messageData.message,
        status: "open",
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

module.exports = createSupportMessage;