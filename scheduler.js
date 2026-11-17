const startReminderScheduler = (db) => {
    setInterval(async () => {
        try {
            const now = new Date();

            const reminders = await db.collection("notifications").find({
                isSent: false,
                scheduledFor: { $lte: now }
            }).toArray();

            for (const reminder of reminders) {
                console.log("Session Reminder:", reminder.title);

                await db.collection("notifications").updateOne(
                    { _id: reminder._id, isSent: false },
                    { $set: { isSent: true } }
                );
            }

        } catch (error) {
            console.log("Scheduler Error:", error);
        }
    }, 10000);
};

module.exports = startReminderScheduler;