import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^0[5-9][0-9]{9}$/.test(v);
            },
            message: props => `${props.value} geçerli bir Türkiye telefon numarası değil!`
        }
    },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'unread', enum: ['unread', 'read'] }
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;