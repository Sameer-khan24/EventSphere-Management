const createEvent = (eventData) => {
    return {
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        category: eventData.category,
        createdAt: new Date()
    };
};

module.exports = createEvent;