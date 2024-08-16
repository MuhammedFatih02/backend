// config.js

// MongoDB bağlantı URI'sini doğrudan çevresel değişkenlerden al
export const dbUri = process.env.MONGODB_URI || '';

// Bağlantı URI'sinin varlığını kontrol et
if (!dbUri) {
    console.error('HATA: MongoDB bağlantı URL\'si bulunamadı. Lütfen MONGODB_URI çevresel değişkenini ayarlayın.');
    process.exit(1);
}

// Sadece geliştirme ortamında config değerlerini yazdır
if (process.env.NODE_ENV !== 'production') {
    console.log('Config yüklendi:');
    console.log('MONGODB_URI:', dbUri);
}