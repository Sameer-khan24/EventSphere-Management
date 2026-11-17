const createSession = (sessionData) => {
    return {
        eventId: sessionData.eventId,
        title: sessionData.title,
        description: sessionData.description,
        speaker: sessionData.speaker,
        topic: sessionData.topic,
        location: sessionData.location,
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        createdAt: new Date()
    };
};

module.exports = createSession;