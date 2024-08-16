// config.js
// MongoDB bağlantı URI'sini doğrudan çevresel değişkenlerden al
export const dbUri = process.env.MONGODB_URL || process.env.MONGODB_URI;

// Bağlantı URI'sinin varlığını kontrol et
if (!dbUri) {
    console.error('HATA: MongoDB bağlantı URL\'si bulunamadı. Lütfen MONGODB_URL veya MONGODB_URI çevresel değişkenini ayarlayın.');
    process.exit(1);
}

// Hata ayıklama için config değerlerini yazdır (opsiyonel)
console.log('Config yüklendi:');
console.log('MONGODB_URL:', dbUri);
