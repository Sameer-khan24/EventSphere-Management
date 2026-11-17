const createApplication = (applicationData, userId) => {
    return {
        eventId: applicationData.eventId,
        exhibitorId: userId,
        boothPreference: applicationData.boothPreference,
        description: applicationData.description,
        status: "pending",
        appliedAt: new Date()
    };
};

module.exports = createApplication;