import express from 'express';
const router = express.Router();
import { addSubCategory, updateSubCategory, deleteSubCategory, getSubCategories } from '../controllers/subCategoriesController.js';

// Alt Kategori Ekleme
router.post('/subcategories', addSubCategory);

// Alt Kategori Güncelleme
router.put('/subcategories/:id', updateSubCategory);

// Alt Kategori Silme
router.delete('/subcategories/:id', deleteSubCategory);

// Alt Kategorileri Listeleme
router.get('/subcategories', getSubCategories);


export default router;
