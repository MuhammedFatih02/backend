import { Router } from 'express';
import { initiatePayment, processPayment, approval, fail, } from '../controllers/paymentController.js';

const router = Router();

router.post('/initiate', initiatePayment);
router.post('/process', processPayment);
router.post('/approval', approval);
router.post('/fail', fail);
// router.get('/status/:merchantOrderId', checkPaymentStatus);

export default router;