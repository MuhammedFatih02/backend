import Contact from '../models/contact.js';

export const createContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();
        res.status(201).json({ message: 'Mesajınız başarıyla gönderildi.' });
    } catch (error) {
        res.status(400).json({ message: 'Bir hata oluştu.', error: error.message });
    }
};

export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Bir hata oluştu.', error: error.message });
    }
};

export const updateContactStatus = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status: 'read' },
            { new: true }
        );
        if (!contact) {
            return res.status(404).json({ message: 'Mesaj bulunamadı.' });
        }
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: 'Bir hata oluştu.', error: error.message });
    }
};