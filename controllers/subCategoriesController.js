import SubCategory from '../models/subCategories.js';
import MainCategory from '../models/mainCategories.js'; // Üst kategori modelinizi doğru isimle import edin

export const addSubCategory = async (req, res) => {
    const { adi, ustKategoriAdi } = req.body;

    try {
        // Üst kategori adına göre _id bulun
        const ustKategori = await MainCategory.findOne({ adi: ustKategoriAdi });
        if (!ustKategori) {
            return res.status(404).json({ message: 'Üst kategori bulunamadı.' });
        }

        // Bulunan _id ve adı ile yeni alt kategori oluşturun
        const subCategory = new SubCategory({
            adi,
            ustKategoriId: ustKategori._id, // Bulunan üst kategori _id'si
            ustKategoriAdi: ustKategori.adi // Bulunan üst kategori adı
        });

        await subCategory.save();
        res.status(201).json({ message: 'Alt kategori başarıyla eklendi.', subCategory });
    } catch (error) {
        res.status(500).json({ message: 'Alt kategori ekleme sırasında bir hata oluştu: ' + error.message });
    }
};

// Alt Kategori Güncelleme
export const updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const { adi, ustKategoriId } = req.body;

    try {
        const subCategory = await SubCategory.findByIdAndUpdate(id, {
            adi,
            ustKategoriId // ObjectId'ye çevirmeye gerek yok
        }, { new: true }); // Güncellenmiş belgeyi döndür

        if (!subCategory) {
            return res.status(404).json({ message: 'Alt kategori bulunamadı.' });
        }

        res.status(200).json({ message: 'Alt kategori başarıyla güncellendi.', subCategory });
    } catch (error) {
        res.status(500).json({ message: 'Alt kategori güncelleme sırasında bir hata oluştu: ' + error.message });
    }
};

// Alt Kategori Silme
export const deleteSubCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const subCategory = await SubCategory.findByIdAndDelete(id);

        if (!subCategory) {
            return res.status(404).json({ message: 'Alt kategori bulunamadı.' });
        }

        res.status(200).json({ message: 'Alt kategori başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Alt kategori silme sırasında bir hata oluştu: ' + error.message });
    }
};

// Alt Kategorileri Listeleme
export const getSubCategories = async (req, res) => {
    const ustKategoriId = req.query.ustKategoriId; // Query'den ustKategoriId'yi al


    try {
        let subCategories;
        if (ustKategoriId) {
            // Eğer ustKategoriId varsa, o ID'ye göre filtrele
            subCategories = await SubCategory.find({ ustKategoriId: ustKategoriId });
        } else {
            // Eğer ustKategoriId yoksa, tüm alt kategorileri getir
            subCategories = await SubCategory.find({});
        }
        res.status(200).json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Alt kategorileri listeleme sırasında bir hata oluştu: ' + error.message });
    }
};
