import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const subCategorySchema = new Schema({
    adi: { type: String, required: true },
    ustKategoriId: { type: mongoose.Schema.Types.ObjectId, ref: 'mainCategories', required: true },
    ustKategoriAdi: { type: String, required: true } // Bu alanı da ekleyin
});
const SubCategory = mongoose.model('SubCategory', subCategorySchema);
export default SubCategory
