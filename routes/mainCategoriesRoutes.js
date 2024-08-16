import express from 'express';
const router = express.Router();
import { addMainCategory, updateMainCategory, deleteMainCategory, getMainCategories } from '../controllers/mainCategoriesController.js';

// Ana Kategori Ekleme (JWT token ile korunur)
router.post('/maincategories', addMainCategory);

// Ana Kategori Güncelleme (JWT token ile korunur)
router.put('/maincategories/:id', updateMainCategory);

// Ana Kategori Silme (JWT token ile korunur)
router.delete('/maincategories/:id', deleteMainCategory);

// Ana Kategorileri Listeleme (JWT token ile korunur)
router.get('/maincategories', getMainCategories);

export default router;
