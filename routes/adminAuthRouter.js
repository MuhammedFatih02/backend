// routes/adminAuthRouter.js
import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/adminAuthController.js';

const router = express.Router();

// Admin kaydı rotası
router.post('/register', registerAdmin);

// Admin girişi rotası
router.post('/login', loginAdmin);

export default router;
