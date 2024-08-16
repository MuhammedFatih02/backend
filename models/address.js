import mongoose from 'mongoose';

const { Schema } = mongoose;

const addressSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true, maxlength: 50 },
    addressLine1: { type: String, required: true, maxlength: 150 },
    buildingNumber: { type: String, required: true },
    city: { type: String, required: true, maxlength: 50 },
    postalCode: { type: String, required: true, maxlength: 5 },
    country: { type: String, default: 'TUR', required: true, maxlength: 3 },
    phoneCountryCode: { type: String, required: true, maxlength: 3 },
    phoneNumber: { type: String, required: true, maxlength: 15 },
    tcNumber: { type: String },
    companyName: { type: String },
    email: { type: String, required: true, maxlength: 254 },
    cardHolderStateCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Address = mongoose.model('Address', addressSchema);

export default Address;