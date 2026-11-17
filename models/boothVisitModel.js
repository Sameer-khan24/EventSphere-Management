const createBoothVisit = (visitData) => {
    return {
        eventId: visitData.eventId,
        boothId: visitData.boothId,
        attendeeId: visitData.attendeeId,
        visitedAt: new Date()
    };
};

module.exports = createBoothVisit;