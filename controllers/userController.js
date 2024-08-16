import User from '../models/user.js';

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';

        const searchRegex = new RegExp(search, 'i');

        const totalUsers = await User.countDocuments({
            $or: [
                { username: searchRegex },
                { email: searchRegex }
            ]
        });

        const users = await User.find({
            $or: [
                { username: searchRegex },
                { email: searchRegex }
            ]
        })
            .select('-password')
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            users,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers
        });
    } catch (error) {
        console.error('getAllUsers işleminde hata oluştu', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-password');
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('getUserById işleminde hata oluştu', error);
        res.status(500).json({ error: 'İç sunucu hatası' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        const { username, email, password, admin } = req.body;

        user.username = username || user.username;
        user.email = email || user.email;
        if (password) {
            user.password = password;
        }
        if (admin !== undefined) {
            user.admin = admin;
        }

        await user.save();

        res.status(200).json({ message: 'Kullanıcı bilgileri başarıyla güncellendi!', user: user });
    } catch (error) {
        console.error('updateUser işleminde hata oluştu', error);
        return res.status(500).json({ error: 'İç sunucu hatası' });
    }
};