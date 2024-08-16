//jwtAuthMiddleware dosyası 
import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Kullanıcı modelinizi uygun şekilde içe aktarın

const jwtAuthMiddleware = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer token'ı al
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT'yi doğrula
        const user = await User.findById(decoded.userId); // Kullanıcıyı bulun
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        req.user = user; // Kullanıcı bilgilerini req.user'a ekleyin
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
    }
};

export default jwtAuthMiddleware;
