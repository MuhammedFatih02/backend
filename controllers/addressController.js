import Address from '../models/address.js';
import Order from '../models/order.js'; // Order modelini eklediğimizden emin olun

export const createAddress = async (req, res) => {
    try {
        const { fullName, addressLine1, buildingNumber, city, postalCode, phoneCountryCode, phoneNumber, tcNumber, companyName, email, cardHolderStateCode, country } = req.body;
        const userId = req.user._id;

        if (req.body.totalAmount >= 1000 && !tcNumber) {
            return res.status(400).json({ message: 'TC numarası 1000 TL ve üzeri satışlarda zorunludur.' });
        }

        const address = new Address({
            userId,
            fullName,
            addressLine1,


            buildingNumber,

            city,

            postalCode,
            phoneCountryCode,
            phoneNumber,
            tcNumber,
            companyName,
            email,
            cardHolderStateCode,
            country
        });

        await address.save();
        res.status(201).json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, addressLine1, buildingNumber, city, postalCode, phoneCountryCode, phoneNumber, tcNumber, companyName, email, cardHolderStateCode, country } = req.body;
        const userId = req.user._id;

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: id, userId: userId },
            {
                fullName,
                addressLine1,


                buildingNumber,

                city,

                postalCode,
                phoneCountryCode,
                phoneNumber,
                tcNumber,
                companyName,
                email,
                cardHolderStateCode,
                country
            },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found or you are not authorized to update this address' });
        }

        res.status(200).json(updatedAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllAddresses = async (req, res) => {
    try {
        const userId = req.user._id;
        const addresses = await Address.find({ userId: userId });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        await Address.findByIdAndDelete(addressId);
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const matchAddressWithOrder = async (req, res) => {
    try {
        const { addressId, orderId } = req.body;

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Burada adres bilgilerini sipariş ile eşleştiriyoruz
        order.address = address._id;
        await order.save();

        res.status(200).json({ message: 'Address matched with order successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getUserAddresses = async (req, res) => {
    try {
        const userId = req.params.userId;
        const addresses = await Address.find({ userId: userId });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
