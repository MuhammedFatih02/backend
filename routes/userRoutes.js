import express from 'express';
import { getAllUsers, getUserById, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);

export default router;