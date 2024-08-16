import express from 'express';
import {
  addOrUpdateProduct,
  deleteProduct,
  getProductDetails,
  getProducts
} from '../controllers/adminProductsController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

router.post('/product', adminAuthMiddleware, (req, res, next) => {
  console.log('POST /product endpoint hit');
  next();
}, addOrUpdateProduct);

router.put('/product/:id', adminAuthMiddleware, (req, res, next) => {
  console.log(`PUT /product/${req.params.id} endpoint hit`);
  next();
}, addOrUpdateProduct);

router.get('/product/:id', adminAuthMiddleware, (req, res, next) => {
  console.log(`GET /product/${req.params.id} endpoint hit`);
  next();
}, getProductDetails);

router.delete('/product/:id', adminAuthMiddleware, (req, res, next) => {
  console.log(`DELETE /product/${req.params.id} endpoint hit`);
  next();
}, deleteProduct);

router.get('/products', adminAuthMiddleware, (req, res, next) => {
  console.log('GET /products endpoint hit');
  next();
}, getProducts);

export default router;
