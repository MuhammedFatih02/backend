import Product from '../models/products.js';
import SubCategory from '../models/subCategories.js';
import MainCategory from '../models/mainCategories.js'; // Üst kategori modelini de import edin

// Ürün ekleme veya güncelleme fonksiyonu
export const addOrUpdateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, imageUrl, companyImgURL, subCategoryName, stock, brand, specifications, variants } = req.body;

  console.log('subCategoryName:', subCategoryName); // subCategoryName değerini logla

  try {
    let product;
    // Alt kategori adına göre SubCategory nesnesini bul
    const subCategory = await SubCategory.findOne({ adi: subCategoryName });
    if (!subCategory) {
      return res.status(404).json({ message: `Alt kategori bulunamadı: ${subCategoryName}` });
    }

    // Üst kategori ID'sini SubCategory nesnesinden al
    const mainCategoryId = subCategory.ustKategoriId;

    if (id) {
      // Ürün güncelleme
      product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı.' });
      }
      product.title = title;
      product.description = description;
      product.price = price;
      product.imageUrl = imageUrl;
      product.companyImgURL = companyImgURL;
      product.mainCategory = mainCategoryId;
      product.subCategory = subCategory._id;
      product.stock = stock;
      product.brand = brand;
      product.specifications = specifications;
      product.variants = variants;
      await product.save();
    } else {
      // Yeni ürün ekleme
      const existingProduct = await Product.findOne({ title });
      if (existingProduct) {
        return res.status(400).json({ message: 'Bu isimde bir ürün zaten var.' });
      }
      product = new Product({
        title,
        description,
        price,
        imageUrl,
        companyImgURL,
        mainCategory: mainCategoryId,
        subCategory: subCategory._id,
        stock,
        brand,
        specifications,
        variants,
      });
      await product.save();
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Ürün işlemi sırasında bir hata oluştu: ' + error.message });
  }
};

// Ürün silme fonksiyonu
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Product.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }
    res.status(200).json({ message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Ürün silinirken bir hata oluştu: ' + error.message });
  }
};

// Tüm ürünleri getirme fonksiyonu (Admin için)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate(['mainCategory', 'subCategory']);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ürün detaylarını getirme fonksiyonu (Admin için)
export const getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('subCategory');
    if (product) {
      const mainCategory = await MainCategory.findById(product.mainCategory);
      res.status(200).json({ ...product.toObject(), mainCategory: mainCategory.adi }); // Üst kategori adını ekleyerek gönder
    } else {
      res.status(404).json({ message: 'Ürün bulunamadı.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ürün detayları getirilirken bir hata oluştu: ' + error.message });
  }
};
