import notesModels from "../models/notesModels.js";
import type { INotes } from '../models/notesModels.js'
import type { Request, Response } from "express";
import type { authenticatedRequest } from '../middleware/authMiddleware.js'
import dotenv from 'dotenv';
dotenv.config();
interface notesContent {
  title: string,
  content: string,
}
interface authenticatedNotesRequest extends Request {
  body: notesContent;
  user?: {
    userId: string;
    userMail: string;
    userName: string;
  };
}

interface deleteNoteRequest extends Request {
  params: {
    id: string;
  };
  user?: {
    userId: string;
    userMail: string;
    userName: string;
  };
}

let addNotes = async (req: authenticatedNotesRequest, res: Response) => {
  try {

    const { title, content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }


    const newNote: INotes | null = await notesModels.create({
      title,
      content,
      User: userId
    });
    res.status(201).json({ message: "Note created successfully", note: newNote });

  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
}


let getNotes = async (req: authenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    // console.log("User i'd ",userId);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const notes: INotes[] = await notesModels.find({ User: userId });
    res.status(200).json({ message: "Notes retrival successfully", notes: notes });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
}

let deleteNode = async (req: deleteNoteRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    console.log(`UserId: ${userId} and noteId: ${id}`);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    
    const note = await notesModels.findOne({ _id: id, User: userId });

    if (!note) {
      return res.status(404).json({
        message: "Note not found or you don't have permission to delete it"
      });
    }

  
    await notesModels.findByIdAndDelete(id);

    res.status(200).json({ message: "Note deleted successfully" });

  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
}

export {addNotes, getNotes, deleteNode}