import express from 'express';
import { createAddress, getAllAddresses, deleteAddress, matchAddressWithOrder, getUserAddresses, updateAddress } from '../controllers/addressController.js';
import authMiddleware from '../middlewares/jwtAuthMiddleware.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import { validateAddress } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, validateAddress, createAddress);
router.get('/getUserAddresses', authMiddleware, getAllAddresses); // Doğru rota
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, deleteAddress);
router.post('/match', authMiddleware, matchAddressWithOrder);
// router.put('/update', authMiddleware, updateAddress);
router.get('/user/:userId', authMiddleware, getUserAddresses);
router.put('/update/:id', authMiddleware, validateAddress, updateAddress);


export default router;
