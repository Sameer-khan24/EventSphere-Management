const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../config/email");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Please provide valid name, email and password"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = name.trim();
        if (role !== undefined && !["attendee", "exhibitor"].includes(role)) {
            return res.status(400).json({
                message: "Invalid user role"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        if (normalizedName.length > 100) {
            return res.status(400).json({
                message: "Name cannot exceed 100 characters"
            });
        }

        if (password.length < 12 || password.length > 128) {
            return res.status(400).json({
                message: "Password must be between 12 and 128 characters"
            });
        }

        const db = req.app.locals.db;

        const existingUser = await db.collection("users").findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const verificationTokenExpiry = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );
        const newUser = {
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: role === "exhibitor" ? "exhibitor" : "attendee",
            isVerified: false,
            isVerified: false,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpiry: verificationTokenExpiry,
            createdAt: new Date()
        };

        await db.collection("users").insertOne(newUser);
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: normalizedEmail,
            subject: "EventSphere - Verify Your Email",
            html: `
        <h2>Welcome to EventSphere!</h2>
        <p>Please verify your email address by clicking below:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create this account, please ignore this email.</p>
    `
        });

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const db = req.app.locals.db;

        const user = await db.collection("users").findOne({ email });


        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }
        if (user.isVerified !== true) {
            return res.status(403).json({
                message: "Please verify your email before logging in."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                tokenVersion: user.tokenVersion || 0
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed"
        });
    }
};


const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                message: "Valid email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const db = req.app.locals.db;

        const user = await db.collection("users").findOne({
            email: normalizedEmail
        });

        if (user && user.isVerified !== true) {
            const verificationToken = crypto.randomBytes(32).toString("hex");

            const hashedVerificationToken = crypto
                .createHash("sha256")
                .update(verificationToken)
                .digest("hex");

            const verificationTokenExpiry = new Date(
                Date.now() + 24 * 60 * 60 * 1000
            );

            await db.collection("users").updateOne(
                { _id: user._id },
                {
                    $set: {
                        emailVerificationToken: hashedVerificationToken,
                        emailVerificationExpiry: verificationTokenExpiry
                    }
                }
            );

            const verificationLink =
                `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: normalizedEmail,
                subject: "EventSphere - Verify Your Email",
                html: `
                    <h2>Verify Your EventSphere Email</h2>
                    <p>Please click below to verify your email address:</p>
                    <a href="${verificationLink}">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                `
            });
        }

        res.json({
            message: "If the account requires verification, a new verification email will be sent."
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to process verification request"
        });
    }
};


const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Verification token is required"
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const db = req.app.locals.db;

        const user = await db.collection("users").findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: { $gt: new Date() },
            isVerified: false
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token"
            });
        }

        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: { isVerified: true },
                $unset: {
                    emailVerificationToken: "",
                    emailVerificationExpiry: ""
                }
            }
        );

        res.json({
            message: "Email verified successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Email verification failed"
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const db = req.app.locals.db;

        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.json({
                message: "If the email is registered, a reset link will be sent."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: hashedToken,
                    resetPasswordExpiry: resetTokenExpiry
                }
            }
        );
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "EventSphere - Password Reset",
            html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your EventSphere password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    `
        });

        res.json({
            message: "If the email is registered, a reset link will be sent."
        });

    } catch (error) {
        res.status(500).json({
            message: "Password reset request failed"
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                message: "Token and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const db = req.app.locals.db;

        const user = await db.collection("users").findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const result = await db.collection("users").updateOne(
            {
                _id: user._id,
                resetPasswordToken: hashedToken,
                resetPasswordExpiry: { $gt: new Date() }
            },
            {
                $set: { password: hashedPassword },
                $inc: { tokenVersion: 1 },
                $unset: {
                    resetPasswordToken: "",
                    resetPasswordExpiry: ""
                }
            }
        );

        if (result.modifiedCount !== 1) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        res.json({
            message: "Password reset successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Password reset failed"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail
};