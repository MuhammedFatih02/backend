import express from 'express';
import { createContact, getContacts, updateContactStatus } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', createContact);
router.get('/', getContacts);
router.put('/:id', updateContactStatus);

export default router;