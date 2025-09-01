import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
export interface authenticatedRequest extends Request {
  user?: {
    userId: string;
    userMail: string;
    userName: string;
  };
}

const authMiddleware = (req: authenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    // console.log(`token ${token}`);
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    // console.log(`Secret key ${process.env.SECRET_KEY}`)
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      userId: string;
      userMail: string;
      userName: string;
    };

    // console.log(`decoded token: ${decoded}`);

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;