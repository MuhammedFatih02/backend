import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            required: true,
            enum: [
                'Ödeme Bekliyor',
                'Ödeme Tamamlandı',
                'Hazırlanıyor',
                'Paketleniyor',
                'Kargoya Verildi',
                'Teslim Edildi',
                'İptal Edildi',
                'İade Edildi'
            ],
            default: 'Ödeme Bekliyor',
        },
        merchantOrderId: {
            type: String,
            required: true,
            unique: true
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;