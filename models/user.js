// models/user.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// User şeması
const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'E-posta adresi zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Lütfen geçerli bir e-posta adresi giriniz']
  },
  username: {
    type: String,
    required: [true, 'Kullanıcı adı zorunludur'],
    unique: false,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Parola zorunludur'],
    minlength: [6, 'Parola en az 6 karakter olmalıdır'],
  },
  admin: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Şifreleme işlemi
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Parolayı hash'le ve şemaya kaydet
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

// User modelini oluştur
const User = mongoose.model('User', userSchema);

export default User;
