import Order from '../models/order.js';
import Product from '../models/products.js';

const generateSimpleId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
};

export const validateCart = async (req, res) => {
    const { orderItems } = req.body;

    try {
        let validatedItems = [];
        let calculatedTotal = 0;
        for (let item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Ürün bulunamadı: ${item.product}` });
            }

            const dbPrice = parseFloat(product.price);

            if (product.stock < item.qty) {
                return res.status(400).json({ message: `Yetersiz stok: ${product.title}, Mevcut: ${product.stock}, İstenen: ${item.qty}` });
            }

            validatedItems.push({
                product: product._id,
                name: product.title,
                qty: item.qty,
                price: dbPrice.toFixed(2)
            });
            calculatedTotal += dbPrice * item.qty;
        }

        res.json({ validatedItems, calculatedTotal: calculatedTotal.toFixed(2) });
    } catch (error) {
        console.error('Doğrulama sunucu hatası:', error.message);
        res.status(500).json({ message: 'Sunucu Hatası', error: error.message });
    }
};
export const createOrder = async (req, res) => {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'Sipariş öğeleri yok' });
    }

    try {
        const merchantOrderId = generateSimpleId();

        const order = new Order({
            user: req.user._id,
            orderItems,
            totalPrice,
            merchantOrderId,
            isPaid: false,
            status: 'Ödeme Bekliyor'
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Sipariş oluşturma hatası:', error);
        res.status(500).json({ message: 'Sunucu Hatası', error: error.message });
    }
};
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        console.error('Siparişleri getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu Hatası' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'username')
            .exec();
        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrder = async (req, res) => {
    const { orderItems, totalPrice, isPaid, status } = req.body;

    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        order.orderItems = orderItems || order.orderItems;
        order.totalPrice = totalPrice || order.totalPrice;
        order.isPaid = isPaid !== undefined ? isPaid : order.isPaid;

        // Yeni durum kontrolü
        if (status && order.status !== status) {
            if (order.status === 'Ödeme Bekliyor' && status === 'Ödeme Alındı') {
                order.isPaid = true;
            }
            order.status = status;
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Sipariş güncelleme hatası:', error);
        res.status(500).json({ message: 'Sunucu Hatası' });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: 'Sipariş silindi' });
        } else {
            res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
    } catch (error) {
        console.error('Sipariş silme hatası:', error);
        res.status(500).json({ message: 'Sunucu Hatası' });
    }
};

export const getOrdersByUserId = async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Yetkisiz: Kullanıcı ID\'si sağlanmadı' });
    }

    try {
        const orders = await Order.find({ user: userId });
        res.json(orders);
    } catch (error) {
        console.error('Kullanıcı siparişlerini getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu Hatası' });
    }
};

export const getAllOrdersWithUserNames = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username')
            .exec();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderDetailsById = async (req, res) => {
    try {
        const { merchantOrderId } = req.params;
        console.log("Backend: Received merchantOrderId:", merchantOrderId);

        if (!merchantOrderId) {
            console.log("Backend: merchantOrderId is undefined or empty");
            return res.status(400).json({ message: 'Geçersiz sipariş numarası' });
        }

        console.log("Backend: Searching for order with merchantOrderId:", merchantOrderId);
        const order = await Order.findOne({ merchantOrderId: merchantOrderId })
            .populate('orderItems.product', 'title price')
            .exec();

        if (!order) {
            console.log("Backend: Order not found for merchantOrderId:", merchantOrderId);
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        const orderDetails = {
            orderItems: order.orderItems,
            totalPrice: order.totalPrice,
            merchantOrderId: order.merchantOrderId
        };

        console.log("Backend: Returning order details:", orderDetails);
        res.status(200).json(orderDetails);
    } catch (error) {
        console.error('Backend: Sipariş detayları getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu Hatası', error: error.message });
    }
};

// Siparişi tamamlama ve stok güncelleme
export const completeOrder = async (req, res) => {
    try {
        // Sipariş numarasına göre siparişi bul
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        if (order) {
            order.isPaid = true;
            order.status = 'Tamamlandı';
            const updatedOrder = await order.save();

            // Stok güncelleme
            await updateStock(order.orderItems);

            res.status(200).json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
    } catch (error) {
        console.error('Sipariş tamamlama hatası:', error);
        res.status(500).json({ message: 'Sunucu Hatası' });
    }
};
