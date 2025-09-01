import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import notesRoutes from './routes/notesRoutes.js'
import authRoutes from './routes/authRoutes.js'
import cors from 'cors';
let app=express();
app.use(cors())
app.use(express.json());
app.use('/auth',authRoutes);
app.use('/home',notesRoutes);

try {
  // console.log("Before connection");
  mongoose.connect(process.env.MONGO_URI!).then(()=>{
    console.log("Database connected successfully");
    app.listen(process.env.PORT,()=>{
      console.log("Server listening on",process.env.PORT);
    })
  })
} catch (error) {
  console.log("Unable to connect to DB, Original error being ",error);
}