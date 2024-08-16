import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid auth header format!' });
        }
        const token = authHeader.split(' ')[1];

        console.log('Received token:', token);
        console.log('JWT_SECRET:', process.env.JWT_SECRET);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.userId);
        console.log('Found user:', user);

        if (!user) {
            return res.status(403).json({ message: 'Access denied: user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Yetkilendirme başarısız oldu:', error);
        res.status(401).json({ message: 'Yetkilendirme başarısız oldu', error: error.message });
    }
};

export default authMiddleware;