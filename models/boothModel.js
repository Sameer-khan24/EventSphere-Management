const createBooth = (boothData) => {
    return {
        eventId: boothData.eventId,
        boothNumber: boothData.boothNumber,
        size: boothData.size,
        location: boothData.location,
        row: boothData.row,
        column: boothData.column,
        price: boothData.price,
        status: "available",
        exhibitorId: null,
        createdAt: new Date()
    };
};

module.exports = createBooth;