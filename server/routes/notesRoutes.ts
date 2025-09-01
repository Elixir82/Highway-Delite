import express from 'express';
const router= express.Router();
import { addNotes, getNotes, deleteNode } from '../src/controllers/notesController';
router.get('/notes',getNotes);
router.post('/addNote',addNotes);
router.post('/deleteNote/:id',deleteNode);

export default router;
