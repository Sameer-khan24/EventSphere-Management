const createMessage = (messageData, senderId) => {
    return {
        senderId: senderId,
        receiverId: messageData.receiverId,
        message: messageData.message,
        createdAt: new Date(),
        isRead: false
    };
};

module.exports = createMessage;