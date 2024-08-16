import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true }, // Güvenlik nedeniyle, bu alan genellikle saklanmaz
  amount: { type: Number, required: true },
  currencyCode: { type: String, required: true },
  merchantOrderId: { type: String, required: true },
  transactionStatus: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
