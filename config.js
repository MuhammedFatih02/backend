// config.js
import dotenv from 'dotenv';

// Sadece geliştirme ortamında .env dosyasını yükle
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// MongoDB bağlantı URI'sini al
export const dbUri = process.env.MONGODB_URL || process.env.MONGODB_URI;

// Bağlantı URI'sinin varlığını kontrol et
if (!dbUri) {
    console.error('HATA: MongoDB bağlantı URL\'si bulunamadı. Lütfen MONGODB_URL veya MONGODB_URI çevresel değişkenini ayarlayın.');
    process.exit(1);
}

// Diğer config değişkenlerini buraya ekleyebilirsiniz
// Örnek:
// export const PORT = process.env.PORT || 3000;
// export const JWT_SECRET = process.env.JWT_SECRET;

// Hata ayıklama için config değerlerini yazdır (opsiyonel)
console.log('Config yüklendi:');
console.log('MONGODB_URL:', dbUri);
// console.log('PORT:', PORT);
// console.log('JWT_SECRET:', JWT_SECRET ? '********' : 'Tanımlanmamış');