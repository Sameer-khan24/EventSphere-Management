const createSessionRegistration = (sessionId, attendeeId) => {
    return {
        sessionId,
        attendeeId,
        registeredAt: new Date(),
        status: "registered"
    };
};

module.exports = createSessionRegistration;