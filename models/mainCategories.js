import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const mainCategorySchema = new Schema({

    adi: { type: String, required: true },
});

const mainCategories = mongoose.model('mainCategories', mainCategorySchema);
export default mainCategories