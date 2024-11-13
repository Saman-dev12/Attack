"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3000;
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later."
});
app.use(express_1.default.json());
app.use(limiter);
app.use((0, cors_1.default)({
    origin: "http://localhost:5173"
}));
const otpStore = {};
const otpRatelimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: "Too many OTP requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});
const resetPasswordRatelimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many OTP requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});
app.post('/generate-otp', otpRatelimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generates a 6-digit OTP
        otpStore[email] = otp;
        console.log(`OTP for ${email}: ${otp}`); // Log the OTP to the console
        res.status(200).json({ message: "OTP generated and logged" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while generating OTP" });
    }
}));
// Endpoint to reset password
app.post('/reset-password', resetPasswordRatelimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, newPassword, token } = req.body;
        if (!email || !otp || !newPassword) {
            res.status(400).json({ message: "Email, OTP, and new password are required" });
        }
        if (!token) {
            res.status(400).json({ message: "Token is required" });
        }
        const formData = new FormData();
        formData.append("secret", process.env.TURNSTILE_SECRET_KEY || '');
        formData.append("response", token);
        const result = yield fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: formData,
        });
        const outcome = yield result.json();
        if (!outcome.success) {
            res.status(400).json({ message: "Invalid captcha" });
        }
        console.log(outcome);
        if (otpStore[email] === otp) {
            console.log(`Password for ${email} has been reset to: ${newPassword}`);
            delete otpStore[email];
            res.status(200).json({ message: "Password has been reset successfully" });
        }
        else {
            res.status(401).json({ message: "Invalid OTP" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while resetting password" });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
