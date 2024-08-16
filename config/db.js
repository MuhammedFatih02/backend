import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("mongodb başarıyla kontak kuruldu");
    } catch (error) {
        console.log("mongodb kontak kurma başarısız  ", error.message);
        throw error;
    }
}
export default connectDB