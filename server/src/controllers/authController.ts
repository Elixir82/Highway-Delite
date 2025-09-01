import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
import type { Request, Response } from "express";
import type { UserI } from "../models/userModel.js";
import UserModel from "../models/userModel.js";
import nodemailer from 'nodemailer';
import optModel from "../models/optModel.js";
import type { Iopt } from '../models/optModel.js';

type signUpBody = {
  name: string;
  email: string;
  dob: string;
};

type otpBody = {
  email: string;
  otp: string;
};

console.log("USER 1:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);
// console.log("Before code");
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log("Transporter error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

let emailSignup = async (req: Request<{}, {}, signUpBody>, res: Response) => {
  try {
    let { name, email, dob } = req.body;
    email = email.toLowerCase();
    console.log("Signup request for:", email);

    let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!validEmail.test(email)) return res.status(400).json({ message: "Invalid email" });

    if (isNaN(Date.parse(dob))) return res.status(400).json({ message: "Invalid date of birth" });

    let existingUser = await UserModel.findOne({ email });
    
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "User already exists and is verified" });
      } else {
        console.log("Unverified user found, allowing OTP resend");
        
        await UserModel.findByIdAndUpdate(existingUser._id, {
          name,
          dob,
          updatedAt: new Date()
        });
      }
    }

    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);

    await optModel.deleteMany({ email });
    await optModel.create({ email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    let createdUser;
    if (!existingUser) {
      createdUser = await UserModel.create({
        name,
        email,
        dob,
        authProvider: "email",
        isVerified: false,
      });
      console.log("User created:", createdUser);
    } else {
      createdUser = existingUser;
      console.log("Using existing unverified user:", createdUser);
    }

    // console.log(`Email sender: ${process.env.EMAIL_USER}`);
    // console.log("Sending email to:", email);

    try {
      await transporter.sendMail({
        from: `"HD" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your account",
        html: `<p>Your OTP is: <b>${otp}</b></p><p>It will expire in 5 minutes.</p>`,
      });
      console.log("Signup email sent successfully to:", email);
    } catch (emailError) {
      console.error("Signup email sending failed:", emailError);
    }

    res.status(200).json({ 
      message: "OTP sent to email", 
      user: createdUser,
      isResend: !!existingUser 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

let otpVerify = async (req: Request<{}, {}, otpBody>, res: Response) => {
  try {
    let { email, otp }: otpBody = req.body;
    email = email.toLowerCase();
    console.log("OTP verification for:", email, "OTP:", otp);

    let DBotp: Iopt | null = await optModel.findOne({ email, otp });
    console.log("Found OTP in DB:", DBotp);

    if (!DBotp) return res.status(400).json({ message: `Couldn't find OTP` });

    if (DBotp.expiresAt.getTime() < Date.now()) {
      await optModel.findByIdAndDelete(DBotp._id);
      return res.status(400).json({ message: "OTP Expired" });
    }

    let user: UserI | null = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User doesn't exist" });

    await optModel.findByIdAndDelete(DBotp._id);

    const updatedUser: UserI | null = await UserModel.findByIdAndUpdate(
      user._id,
      { $set: { isVerified: true } },
      { new: true }
    );

    if (!updatedUser) return res.status(400).json({ message: `Couldn't update user ${user.name}` });

    const jwtResp = jwt.sign(
      {
        userId: updatedUser._id,
        userMail: updatedUser.email,
        userName: updatedUser.name,
      },
      process.env.SECRET_KEY!,
      { expiresIn: "7d" }
    );

    console.log("User verified successfully:", updatedUser.name);
    res.status(200).json({ message: `Verified as ${user.name}`, token: jwtResp, user: updatedUser });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

let emailLogin = async (req: Request<{}, {}, { email: string }>, res: Response) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase();
    console.log("Email login request for: ", email);

    let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!validEmail.test(email)) return res.status(400).json({ message: "Invalid email" });

    let user: UserI | null = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User doesn't exist" });

    if (!user.isVerified) return res.status(400).json({ message: "User not verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated login OTP:", otp);

    await optModel.deleteMany({ email });
    await optModel.create({ email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    console.log(`Email sender 2 ${process.env.EMAIL_USER}`);
    console.log("Email 2: ", email);

    try {
      await transporter.sendMail({
        from: `"HD" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your account",
        html: `<p>Your OTP is: <b>${otp}</b></p><p>It will expire in 5 minutes.</p>`,
      });
      console.log("Login email sent successfully to:", email);
    } catch (emailError) {
      console.error("Login email sending failed:", emailError);
    }

    res.status(200).json({ message: "Login OTP sent to email" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

let loginOtpVerify = async (req: Request<{}, {}, otpBody>, res: Response) => {
  try {
    let { email, otp }: otpBody = req.body;
    console.log(`Login OTP verify: Email: ${email} and OTP: ${otp}`);

    email = email.toLowerCase();

    let DBotp: Iopt | null = await optModel.findOne({ email, otp });
    console.log(`DBotp found: ${DBotp}`);

    if (!DBotp) return res.status(400).json({ message: "Invalid OTP" });

    if (DBotp.expiresAt.getTime() < Date.now()) {
      await optModel.findByIdAndDelete(DBotp._id);
      return res.status(400).json({ message: "OTP Expired" });
    }

    let user: UserI | null = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User doesn't exist" });

    await optModel.findByIdAndDelete(DBotp._id);

    console.log(`user: ${user}`);

    const jwtResp = jwt.sign(
      {
        userId: user._id,
        userMail: user.email,
        userName: user.name,
      },
      process.env.SECRET_KEY!,
      { expiresIn: "7d" }
    );

    console.log(`token generated: ${jwtResp}`);

    res.status(200).json({ message: `Logged in as ${user.name}`, token: jwtResp, user: user });
  } catch (error) {
    console.error("Login OTP verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

let resendOtp = async (req: Request<{}, {}, { email: string }>, res: Response) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase();

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // if (user.isVerified) {
    //   return res.status(400).json({ message: "User is already verified" });
    // }

    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    // console.log("Resending OTP:", otp);

    await optModel.deleteMany({ email });
    await optModel.create({ email, otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

    // Send email code here (same as in emailSignup)

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { emailSignup, otpVerify, emailLogin, loginOtpVerify, resendOtp};