// index.js
import express from 'express';
import connectDB from './db.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoute.js';
import adminProductsRoutes from './routes/adminProductsRoutes.js';
import adminAuthRouter from './routes/adminAuthRouter.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import subCategoriesRoutes from './routes/subCategoriesRoutes.js';
import mainCategoriesRoutes from './routes/mainCategoriesRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import cors from 'cors';
import logger from './utils/logger.js';
import bodyParser from 'body-parser';
import helmet from 'helmet'; // Helmet'ı ekleyin

const app = express();
const port = 3000;

// Güvenlik başlıkları için Helmet'ı kullanın
app.use(helmet());

// X-Powered-By başlığını kaldırın
app.disable('x-powered-by');

// CORS ayarlarını güncelle
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://41b3aebbe066ec0062db927a0b8f7d0f.serveo.net',
    'https://61f409135b531c9ea157e39b42d8d9b0.serveo.net' // frontend
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CSP ayarları (geliştirme için geniş, canlıya alırken sıkılaştırın)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: ["'self'", ...corsOptions.origin],
  },
}));

app.get('/', (req, res) => {
  res.send('Merhaba Dünya');
});

app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', userRoutes);
app.use('/admin', adminProductsRoutes);
app.use('/admin', adminAuthRouter);
app.use('/admin', subCategoriesRoutes);
app.use('/admin', mainCategoriesRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contacts', contactRoutes);

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB başarıyla bağlandı');

    app.listen(port, () => {
      console.log(`Sunucu ${port} üzerinden çalışıyor`);
    });
  } catch (error) {
    console.error('Sunucu başlatılamadı', error);
    process.exit(1);
  }
};

startServer();
