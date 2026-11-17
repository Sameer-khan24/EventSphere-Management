const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many password reset requests. Please try again after 15 minutes."
    }
});


const resendVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many verification requests. Please try again after 15 minutes."
    }
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many registration attempts. Please try again after 15 minutes."
    }
});


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        message: "Too many failed login attempts. Please try again after 15 minutes."
    }
});

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail
} = require("../controllers/authController");

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPassword
);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post(
    "/resend-verification",
    resendVerificationLimiter,
    resendVerificationEmail
);
module.exports = router;