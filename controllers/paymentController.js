import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import xml2js from 'xml2js';
import Payment from '../models/paymentModel.js';
import Order from '../models/order.js';
import Product from '../models/products.js';

const cardVerificationUrl = "https://boatest.kuveytturk.com.tr/boa.virtualpos.services/Home/ThreeDModelPayGate";
const paymentConfirmationUrl = "https://boatest.kuveytturk.com.tr/boa.virtualpos.services/Home/ThreeDModelProvisionGate";
const apiPassword = "api123";
const merchantId = "496";
const customerId = "400235";
const userName = "apitest";
const okUrl = 'http://localhost:3000/api/payments/approval';
const failUrl = 'http://localhost:3000/api/payments/fail';

const getCardType = (cardNumber) => {
    if (/^4/.test(cardNumber)) {
        return 'Visa';
    } else if (/^5[1-5]/.test(cardNumber) || /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(cardNumber)) {
        return 'MasterCard';
    } else if (/^9792/.test(cardNumber)) {
        return 'Troy';
    } else {
        throw new Error('Geçersiz kart numarası');
    }
};

const validateIPv4 = (ip) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) return false;
    return ip.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255);
};

export const initiatePayment = async (req, res) => {
    logger.info('Ödeme başlatma isteği alındı');
    logger.info(`İstek gövdesi: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const {
            cardNumber,
            cardExpireDateYear,
            cardExpireDateMonth,
            cardCVV2,
            cardHolderName,
            amount,
            currencyCode,
            merchantOrderId,
            cardHolderData
        } = req.body;

        let clientIP = req.ip || req.connection.remoteAddress;
        if (clientIP.substr(0, 7) == "::ffff:") {
            clientIP = clientIP.substr(7);
        }

        logger.info(`Tespit edilen IP adresi: ${clientIP}`);

        if (!validateIPv4(clientIP)) {
            logger.warn(`Geçersiz IP adresi tespit edildi: ${clientIP}. Varsayılan IP kullanılacak.`);
            clientIP = '127.0.0.1';
        }

        const hashData = generateHashData(merchantOrderId, amount);
        logger.info(`Oluşturulan hash verisi: ${hashData}`);

        const xmlData = `
            <KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
              <APIVersion>2.0.0</APIVersion>
              <OkUrl>${okUrl}</OkUrl>
              <FailUrl>${failUrl}</FailUrl>
              <HashData>${hashData}</HashData>
              <MerchantId>${merchantId}</MerchantId>
              <CustomerId>${customerId}</CustomerId>
              <UserName>${userName}</UserName>
              <CardNumber>${cardNumber}</CardNumber>
              <CardExpireDateYear>${cardExpireDateYear}</CardExpireDateYear>
              <CardExpireDateMonth>${cardExpireDateMonth}</CardExpireDateMonth>
              <CardCVV2>${cardCVV2}</CardCVV2>
              <CardHolderName>${cardHolderName}</CardHolderName>
              <CardType>${getCardType(cardNumber)}</CardType>
              <BatchID>0</BatchID>
              <TransactionType>Sale</TransactionType>
              <InstallmentCount>0</InstallmentCount>
              <Amount>${amount}</Amount>
              <DisplayAmount>${amount}</DisplayAmount>
              <CurrencyCode>${currencyCode}</CurrencyCode>
              <MerchantOrderId>${merchantOrderId}</MerchantOrderId>
              <TransactionSecurity>3</TransactionSecurity>
            </KuveytTurkVPosMessage>
        `;

        logger.info(`Gönderilen XML isteği: ${xmlData}`);

        const response = await axios.post(cardVerificationUrl, xmlData, {
            headers: { 'Content-Type': 'application/xml' },
        });

        logger.info(`Alınan yanıt durumu: ${response.status}`);
        logger.info(`Alınan yanıt verileri: ${JSON.stringify(response.data)}`);

        res.status(200).send(response.data);
    } catch (error) {
        logger.error(`Ödeme başlatma hatası: ${error.message}`);
        res.status(500).json({
            error: 'Ödeme başlatılamadı',
            details: error.message
        });
    }
};

export const approval = async (req, res) => {
    logger.info('3D Secure onayı alındı');
    logger.info(`İstek gövdesi: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const decodedXML = decodeURIComponent(req.body.AuthenticationResponse).replace(/\+/g, ' ');
        logger.info(`Decoded XML: ${decodedXML}`);

        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(decodedXML);
        logger.info(`Parsed XML: ${JSON.stringify(result, null, 2)}`);

        const md = result.VPosTransactionResponseContract.MD;
        const merchantOrderId = result.VPosTransactionResponseContract.MerchantOrderId;
        const amount = result.VPosTransactionResponseContract.VPosMessage.Amount;
        const responseCode = result.VPosTransactionResponseContract.ResponseCode;

        logger.info(`Çıkarılan veriler - MD: ${md}, MerchantOrderId: ${merchantOrderId}, Amount: ${amount}, ResponseCode: ${responseCode}`);

        if (!md || !merchantOrderId || !amount || !responseCode) {
            throw new Error('Ödeme işlemi için gerekli veriler eksik');
        }

        const paymentResult = await processPayment({
            body: {
                MerchantOrderId: merchantOrderId,
                Amount: amount,
                MD: md,
                ResponseCode: responseCode
            }
        });

        logger.info(`Payment result: ${JSON.stringify(paymentResult)}`);

        if (paymentResult.success) {
            try {
                const yeniÖdeme = new Payment({
                    cardNumber: 'Gizli',
                    amount: parseFloat(amount),
                    currencyCode: '949',
                    merchantOrderId: merchantOrderId,
                    transactionStatus: 'onaylandı'
                });

                await yeniÖdeme.save();
                logger.info(`Ödeme veritabanına kaydedildi: ${yeniÖdeme._id}`);

                const order = await Order.findOne({ merchantOrderId: merchantOrderId }).populate('orderItems.product');
                if (order) {
                    order.isPaid = true;
                    order.status = 'Ödeme Tamamlandı';
                    await order.save();
                    logger.info(`Sipariş güncellendi: ${order._id}`);

                    // Stok güncelleme işlemi
                    await updateStock(order.orderItems);

                } else {
                    logger.error(`Sipariş bulunamadı: ${merchantOrderId}`);
                    throw new Error(`Sipariş bulunamadı: ${merchantOrderId}`);
                }

                // Başarılı ödeme sayfasını göster
                res.send(`
                    <html>
                        <head>
                            <title>Ödeme Başarılı</title>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                                h1 { color: #4CAF50; }
                                p { font-size: 18px; }
                            </style>
                        </head>
                        <body>
                            <h1>Ödeme Başarıyla Tamamlandı</h1>
                            <p>Sipariş numarası: ${merchantOrderId}</p>
                            <script>
                                setTimeout(() => {
                                    window.opener.location.reload();
                                    window.close();
                                }, 5000);
                            </script>
                        </body>
                    </html>
                `);
            } catch (dbError) {
                logger.error(`Veritabanı işlem hatası: ${dbError.message}`);
                throw dbError;
            }
        } else {
            // Başarısız ödeme sayfasını göster
            res.send(`
                <html>
                    <head>
                        <title>Ödeme Başarısız</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                            h1 { color: #f44336; }
                            p { font-size: 18px; }
                        </style>
                    </head>
                    <body>
                        <h1>Ödeme İşlemi Başarısız</h1>
                        <p>Hata: ${paymentResult.error || 'Bilinmeyen bir hata oluştu'}</p>
                        <p>Lütfen daha sonra tekrar deneyiniz veya müşteri hizmetleriyle iletişime geçiniz.</p>
                        <script>
                            setTimeout(() => {
                                window.close();
                            }, 5000);
                        </script>
                    </body>
                </html>
            `);
        }
    } catch (error) {
        logger.error(`3D Secure onay hatası: ${error.message}`);
        logger.error(`Hata yığını: ${error.stack}`);

        res.status(500).send(`
            <html>
                <head>
                    <title>İşlem Hatası</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                        h1 { color: #f44336; }
                        p { font-size: 18px; }
                    </style>
                </head>
                <body>
                    <h1>Ödeme İşleminde Bir Hata Oluştu</h1>
                    <p>Üzgünüz, ödeme işlemi sırasında bir hata meydana geldi.</p>
                    <p>Lütfen daha sonra tekrar deneyiniz veya müşteri hizmetleriyle iletişime geçiniz.</p>
                    <script>
                        setTimeout(() => {
                            window.close();
                        }, 5000);
                    </script>
                </body>
            </html>
        `);
    }
};

// Stok güncelleme fonksiyonu
async function updateStock(orderItems) {
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            if (product.stock >= item.qty) {
                product.stock -= item.qty;
                await product.save();
                logger.info(`Ürün stok güncellendi: ${product._id}, Yeni stok: ${product.stock}`);
            } else {
                logger.error(`Yetersiz stok: ${product._id}, İstenen: ${item.qty}, Mevcut: ${product.stock}`);
                throw new Error(`Yetersiz stok: ${product.title}`);
            }
        } else {
            logger.error(`Ürün bulunamadı: ${item.product}`);
            throw new Error(`Ürün bulunamadı: ${item.product}`);
        }
    }
}

export const processPayment = async (req) => {
    logger.info('Ödeme işleme başladı');
    logger.info(`İşlenecek ödeme verileri: ${JSON.stringify(req.body, null, 2)}`);

    try {
        const { MerchantOrderId, Amount, MD, ResponseCode } = req.body;

        // Giriş parametrelerini kontrol et
        if (!MerchantOrderId || !Amount || !MD || !ResponseCode) {
            logger.error('Eksik parametreler:', { MerchantOrderId, Amount, MD, ResponseCode });
            throw new Error('Ödeme işlemi için gerekli alanlar eksik');
        }

        logger.info(`MD değeri: ${MD}`);
        logger.info(`MerchantOrderId: ${MerchantOrderId}`);
        logger.info(`Amount: ${Amount}`);
        logger.info(`ResponseCode: ${ResponseCode}`);

        const hashData = generateHashDataForPayment(MerchantOrderId, Amount);
        logger.info(`Ödeme için oluşturulan hash verisi: ${hashData}`);

        const xmlData = `
            <KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
              <APIVersion>2.0.0</APIVersion>
              <HashData>${hashData}</HashData>
              <MerchantId>${merchantId}</MerchantId>
              <CustomerId>${customerId}</CustomerId>
              <UserName>${userName}</UserName>
              <TransactionType>Sale</TransactionType>
              <InstallmentCount>0</InstallmentCount>
              <Amount>${Amount}</Amount>
              <MerchantOrderId>${MerchantOrderId}</MerchantOrderId>
              <TransactionSecurity>3</TransactionSecurity>
              <KuveytTurkVPosAdditionalData>
                <AdditionalData>
                  <Key>MD</Key>
                  <Data>${MD}</Data>
                </AdditionalData>
              </KuveytTurkVPosAdditionalData>
            </KuveytTurkVPosMessage>
        `;

        logger.info(`Gönderilen ödeme XML isteği: ${xmlData}`);

        logger.info(`İstek gönderiliyor: ${paymentConfirmationUrl}`);

        const startTime = Date.now();
        const response = await axios.post(paymentConfirmationUrl, xmlData, {
            headers: { 'Content-Type': 'application/xml' },
            timeout: 30000 // 30 saniye timeout
        });
        const endTime = Date.now();

        logger.info(`İstek süresi: ${endTime - startTime}ms`);
        logger.info(`Alınan yanıt durumu: ${response.status}`);
        logger.info(`Alınan yanıt başlıkları: ${JSON.stringify(response.headers)}`);
        logger.info(`Alınan ham yanıt verileri: ${response.data}`);

        // XML yanıtını parse et
        let parsedResponse;
        try {
            parsedResponse = await xml2js.parseStringPromise(response.data, { explicitArray: false });
            logger.info(`Parsed response: ${JSON.stringify(parsedResponse, null, 2)}`);
        } catch (parseError) {
            logger.error(`XML parse hatası: ${parseError.message}`);
            throw new Error('XML yanıtı parse edilemedi');
        }

        const responseBody = parsedResponse.VPosTransactionResponseContract;

        if (!responseBody) {
            logger.error('Yanıt gövdesi bulunamadı');
            throw new Error('Geçersiz yanıt formatı');
        }

        logger.info(`ResponseCode: ${responseBody.ResponseCode}`);
        logger.info(`ResponseMessage: ${responseBody.ResponseMessage}`);

        if (responseBody.ResponseCode === '00' || responseBody.ResponseCode === '000') {
            logger.info('Ödeme başarıyla tamamlandı');
            return {
                success: true,
                message: 'Ödeme başarıyla tamamlandı',
                data: responseBody
            };
        } else {
            logger.error(`Ödeme hatası: ${responseBody.ResponseMessage}`);
            return {
                success: false,
                error: 'Ödeme tamamlanamadı',
                details: responseBody.ResponseMessage
            };
        }
    } catch (error) {
        logger.error(`Ödeme işleme hatası: ${error.message}`);
        logger.error(`Hata yığını: ${error.stack}`);

        if (error.response) {
            // Sunucudan hata yanıtı alındı
            logger.error(`Hata yanıt durumu: ${error.response.status}`);
            logger.error(`Hata yanıt başlıkları: ${JSON.stringify(error.response.headers)}`);
            logger.error(`Hata yanıt verisi: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            // İstek yapıldı ama yanıt alınamadı
            logger.error('Yanıt alınamadı');
            logger.error(`İstek detayları: ${JSON.stringify(error.request)}`);
        } else {
            // İstek oluşturulurken bir hata oluştu
            logger.error('İstek oluşturma hatası');
        }

        throw error;
    }
};
const generateHashData = (merchantOrderId, amount) => {
    const hashedPassword = crypto.createHash('sha1').update(apiPassword, 'ISO-8859-9').digest('base64');
    const hashString = `${merchantId}${merchantOrderId}${amount}${okUrl}${failUrl}${userName}${hashedPassword}`;
    return crypto.createHash('sha1').update(hashString, 'ISO-8859-9').digest('base64');
};

const generateHashDataForPayment = (merchantOrderId, amount) => {
    const hashedPassword = crypto.createHash('sha1').update(apiPassword, 'ISO-8859-9').digest('base64');
    const hashString = `${merchantId}${merchantOrderId}${amount}${userName}${hashedPassword}`;
    logger.info(`Hash string: ${hashString}`);
    return crypto.createHash('sha1').update(hashString, 'ISO-8859-9').digest('base64');
};

export const fail = (req, res) => {
    logger.info('3D Secure işlemi başarısız');
    logger.info(`Başarısız işlem detayları: ${JSON.stringify(req.body, null, 2)}`);
    res.status(400).json({
        error: '3D Secure işlemi başarısız oldu',
        details: req.body
    });
};