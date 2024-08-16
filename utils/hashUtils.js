import crypto from 'crypto';

export const generateHashData = (customerId, merchantId, orderId, amount, merchantPassword) => {
    const hashString = `${customerId}${orderId}${amount}${merchantPassword}`;
    return crypto.createHash('sha1').update(hashString).digest('base64');
};
