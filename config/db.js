// db.js
import mongoose from 'mongoose';
import { dbUri } from './config.js';

const connectDB = async () => {
    try {
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB başarıyla bağlantı kuruldu.');
    } catch (error) {
        console.error('MongoDB bağlantısı sırasında hata:', error.message);
        process.exit(1);
    }
}

export default connectDB;
