const createEventRegistration = (eventId, attendeeId) => {
    return {
        eventId: eventId,
        attendeeId: attendeeId,
        registeredAt: new Date(),
        status: "registered"
    };
};

module.exports = createEventRegistration;