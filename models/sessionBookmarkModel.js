const createSessionBookmark = (sessionId, attendeeId) => {
    return {
        sessionId,
        attendeeId,
        bookmarkedAt: new Date()
    };
};

module.exports = createSessionBookmark;