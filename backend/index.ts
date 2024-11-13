import express from 'express';
import {rateLimit} from "express-rate-limit"
import dotenv from "dotenv"
import cors from "cors"
dotenv.config()

const app = express();
const PORT = 3000;
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});

app.use(express.json());
app.use(limiter);
app.use(cors({
  origin: "http://localhost:5173"
}))

const otpStore: Record<string, string> = {};

const otpRatelimiter = rateLimit({
    windowMs:5*60*1000,
    max: 3,
    message: "Too many OTP requests, please try again later.",
    standardHeaders:true,
    legacyHeaders:false
})

const resetPasswordRatelimiter = rateLimit({
    windowMs:15*60*1000,
    max: 5,
    message: "Too many OTP requests, please try again later.",
    standardHeaders:true,
    legacyHeaders:false
})

app.post('/generate-otp',otpRatelimiter, async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generates a 6-digit OTP
    otpStore[email] = otp;

    console.log(`OTP for ${email}: ${otp}`); // Log the OTP to the console
    res.status(200).json({ message: "OTP generated and logged" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while generating OTP" });
  }
});

// Endpoint to reset password
app.post('/reset-password',resetPasswordRatelimiter, async (req, res) => {
  try {
    const { email, otp, newPassword,token } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: "Email, OTP, and new password are required" });
    }
    if (!token) {
      res.status(400).json({ message: "Token is required" });
    }
    const formData = new FormData();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY || '');
    formData.append("response", token);

    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
    const outcome = await result.json();
    if (!outcome.success) {
      res.status(400).json({ message: "Invalid captcha" });
    }

    console.log(outcome);
    

    if (otpStore[email] === otp) {
      console.log(`Password for ${email} has been reset to: ${newPassword}`);
      delete otpStore[email]; 
      res.status(200).json({ message: "Password has been reset successfully" });
    } else {
      res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while resetting password" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});