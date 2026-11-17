const createExhibitor = (exhibitorData) => {
    return {
        companyName: exhibitorData.companyName,
        description: exhibitorData.description,
        industry: exhibitorData.industry,
        contactEmail: exhibitorData.contactEmail,
        phone: exhibitorData.phone,

        logo: exhibitorData.logo || null,
        productsServices: exhibitorData.productsServices || [],
        staff: exhibitorData.staff || [],
        documents: exhibitorData.documents || [],

        createdAt: new Date()
    };
};

module.exports = createExhibitor;