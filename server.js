require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const feedbackRoutes = require("./routes/feedbackRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const supportMessageRoutes = require("./routes/supportMessageRoutes");
const floorPlanRoutes = require("./routes/floorPlanRoutes");
const boothRoutes = require("./routes/boothRoutes");
const startReminderScheduler = require("./scheduler");
const notificationRoutes = require("./routes/notificationRoutes");
const sessionBookmarkRoutes = require("./routes/sessionBookmarkRoutes");
const sessionRegistrationRoutes = require("./routes/sessionRegistrationRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const attendeeRoutes = require("./routes/attendeeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const exhibitorRoutes = require("./routes/exhibitorRoutes");
const boothVisitRoutes = require("./routes/boothVisitRoutes");
const eventRoutes = require("./routes/eventRoutes");
const verifyRole = require("./middleware/roleMiddleware");
const verifyToken = require("./middleware/authMiddleware");
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const server = express();
const httpServer = http.createServer(server);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

server.locals.io = io;

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.use(cors());
server.use(express.json());
const path = require("path");

server.use(
    "/uploads/logos",
    express.static(path.join(__dirname, "uploads/logos"))
);
server.use("/api/auth", authRoutes);
server.use("/api/events", eventRoutes);
server.use("/api/exhibitors", exhibitorRoutes);
server.use("/api/applications", applicationRoutes);
server.use("/api/admin", adminRoutes);
server.use("/api/messages", messageRoutes);
server.use("/api/attendee", attendeeRoutes);
server.use("/api/sessions", sessionRoutes);
server.use("/api/session-registrations", sessionRegistrationRoutes);
server.use("/api/session-bookmarks", sessionBookmarkRoutes);
server.use("/api/notifications", notificationRoutes);
server.use("/api/booths", boothRoutes);
server.use("/api/booth-visits", boothVisitRoutes);
server.use("/api/floor-plan", floorPlanRoutes);
server.use("/api/support", supportMessageRoutes);
server.use("/api/analytics", analyticsRoutes);
server.use("/api/feedback", feedbackRoutes);

server.get("/", (req, res) => {
    res.send("EventSphere Backend is Running!");
});
server.get("/api/auth/profile", verifyToken, (req, res) => {
    res.json({
        message: "Access granted",
        user: req.user
    });
});
server.get("/api/auth/exhibitor-dashboard", verifyToken, verifyRole(["exhibitor"]), (req, res) => {
    res.json({
        message: "Welcome to Exhibitor Dashboard"
    });
});

const PORT = process.env.PORT;

async function startServer() {
    try {
        server.locals.db = await connectDB();
        startReminderScheduler(server.locals.db);
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.log("Database Error:", error);
    }
}

startServer();