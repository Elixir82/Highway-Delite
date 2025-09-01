import express from 'express';
const router= express.Router();
import { addNotes, getNotes, deleteNode } from '../controllers/notesController.js';
import authMiddleware from '../middleware/authMiddleware.js';
router.get('/notes',authMiddleware,getNotes);
router.post('/addNote',authMiddleware,addNotes);
router.delete('/deleteNote/:id',authMiddleware,deleteNode);

export default router;
