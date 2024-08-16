import Product from '../models/products.js';
import FuzzySearch from 'fuzzy-search';

// Ürün ekleme fonksiyonu
export const addProduct = async (req, res) => {
  try {
    const { title, description, price, imageUrl, companyImgURL } = req.body;

    // Aynı isimde bir ürün olup olmadığını kontrol et
    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return res.status(400).json({ message: 'Bu isimde bir ürün zaten var.' });
    }

    const newProduct = new Product({ title, description, price, imageUrl, companyImgURL });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tüm ürünleri getirme fonksiyonu
export const getProducts = async (req, res) => {
  try {
    const { subCategoryId } = req.query; // subCategoryId'yi query parametresinden al
    let query = {};
    if (subCategoryId) {
      query = { subCategory: subCategoryId };
    }
    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ürünleri ID ile getirme
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Ürün bulunamadı.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ürün getirilirken bir hata oluştu: ' + error.message });
  }
};

// ID ile ürün düzenleme
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, imageUrl, companyImgURL } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    product.title = title;
    product.description = description;
    product.price = price;
    product.imageUrl = imageUrl;
    product.companyImgURL = companyImgURL; // companyImgURL alanı eklendi

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Ürün güncellenirken bir hata oluştu: ' + error.message });
  }
};

// ID ile ürün silme
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Belirli bir ID'ye sahip ürünü sil
    const result = await Product.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    res.status(200).json({ message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Ürün silinirken bir hata oluştu: ' + error.message });
  }
};

// Ürünlerde arama fonksiyonu (bulanık arama ile birlikte)
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Arama sorgusu gerekli.' });
    }

    const products = await Product.find({});
    const searcher = new FuzzySearch(products, ['title', 'description', 'brand'], {
      caseSensitive: false,
      sort: true,
    });

    const result = searcher.search(query);
    res.status(200).json(result);
  } catch (error) {
    console.error('Ürün arama hatası:', error);
    res.status(500).json({ message: 'Ürün arama sırasında bir hata oluştu.', error: error.message });
  }
};
