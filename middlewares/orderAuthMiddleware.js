const orderAuthMiddleware = (req, res, next) => {
    try {
        // Kullanıcı kimliğini doğrula
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized: User ID not provided' });
        }

        // Bir sonraki middleware veya route'a devam et
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

export default orderAuthMiddleware;
