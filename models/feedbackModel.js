const createFeedback = (feedbackData) => {
    return {
        userId: feedbackData.userId,
        userRole: feedbackData.userRole,
        subject: feedbackData.subject,
        message: feedbackData.message,
        rating: feedbackData.rating,
        status: "pending",
        adminReply: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

module.exports = createFeedback;