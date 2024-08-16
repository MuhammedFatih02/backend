import MainCategory from '../models/mainCategories.js';

// Ana Kategori Ekleme
export const addMainCategory = async (req, res) => {
    const { adi } = req.body;

    try {
        const mainCategory = new MainCategory({
            adi
        });

        await mainCategory.save();
        res.status(201).json({ message: 'Ana kategori başarıyla eklendi.' });
    } catch (error) {
        res.status(500).json({ message: 'Ana kategori ekleme sırasında bir hata oluştu: ' + error.message });
    }
};

// Ana Kategori Güncelleme
export const updateMainCategory = async (req, res) => {
    const { id } = req.params;
    const { adi } = req.body;

    try {
        const mainCategory = await MainCategory.findByIdAndUpdate(id, {
            adi
        });

        if (!mainCategory) {
            return res.status(404).json({ message: 'Ana kategori bulunamadı.' });
        }

        res.status(200).json({ message: 'Ana kategori başarıyla güncellendi.' });
    } catch (error) {
        res.status(500).json({ message: 'Ana kategori güncelleme sırasında bir hata oluştu: ' + error.message });
    }
};

// Ana Kategori Silme
export const deleteMainCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await MainCategory.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Ana kategori bulunamadı.' });
        }

        res.status(200).json({ message: 'Ana kategori başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Ana kategori silme sırasında bir hata oluştu: ' + error.message });
    }
};

// Ana Kategorileri Listeleme
export const getMainCategories = async (req, res) => {
    try {
        const mainCategories = await MainCategory.find({});
        res.status(200).json(mainCategories);
    } catch (error) {
        res.status(500).json({ message: 'Ana kategorileri listeleme sırasında bir hata oluştu: ' + error.message });
    }
};
