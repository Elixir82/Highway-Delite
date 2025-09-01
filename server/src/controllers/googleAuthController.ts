import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import UserModel from "../models/userModel.js"; 
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response) => {
  try {
    console.log("Google auth request received");
    
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.error("Google client ID not configured");
      return res.status(500).json({ message: "Google client ID not configured" });
    }
    
    const { token } = req.body;
    console.log("Token received:", token ? "Yes" : "No");

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    // console.log("Google payload:", payload);
    
    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { email, name, sub } = payload; 
    // console.log("User data from Google:", { email, name, sub });
    
    let user = await UserModel.findOne({ email });
    // console.log("Existing user found:", user ? "Yes" : "No");

    if (!user) {
      // console.log("Creating new user from Google auth");
      user = await UserModel.create({
        googleId: sub,
        email,
        name,
        authProvider: 'google', 
        isVerified: true, 
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id, userMail: user.email, userName: user.name },
      process.env.SECRET_KEY!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    // console.log("Google auth successful for user:", user.email);
    res.json({ accessToken, refreshToken, user });
    
  } catch (error) {
    console.error("Google Auth error details:", error);
    res.status(500).json({ 
      message: "Google Auth failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};