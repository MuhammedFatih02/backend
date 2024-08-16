import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const {
    KUVEYT_TURK_API_URL,
    KUVEYT_TURK_MERCHANT_ID,
    KUVEYT_TURK_USER_NAME,
    KUVEYT_TURK_PASSWORD,
    KUVEYT_TURK_CUSTOMER_ID
} = process.env;

const getHashData = (merchantOrderId, amount) => {
    const hashedPassword = crypto.createHash('sha1').update(KUVEYT_TURK_PASSWORD, 'ISO-8859-9').digest('base64');
    const hashString = `${KUVEYT_TURK_MERCHANT_ID}${merchantOrderId}${amount}${KUVEYT_TURK_USER_NAME}${hashedPassword}`;
    return crypto.createHash('sha1').update(hashString, 'ISO-8859-9').digest('base64');
};

const sendRequest = async (data) => {
    try {
        const response = await axios.post(KUVEYT_TURK_API_URL, data, {
            headers: {
                'Content-Type': 'text/xml'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending request to Kuveyt Turk API:', error);
        throw error;
    }
};

export const initiatePaymentRequest = async (orderId, amount, cardDetails) => {
    const hashData = getHashData(orderId, amount);
    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://boa.net/BOA.Integration.VirtualPos/Service">
        <soapenv:Header/>
        <soapenv:Body>
            <ser:ProcessPayment>
                <ser:request>
                    <ser:IsFromExternalNetwork>true</ser:IsFromExternalNetwork>
                    <ser:CustomerId>${KUVEYT_TURK_CUSTOMER_ID}</ser:CustomerId>
                    <ser:MerchantId>${KUVEYT_TURK_MERCHANT_ID}</ser:MerchantId>
                    <ser:Amount>${amount}</ser:Amount>
                    <ser:OrderId>${orderId}</ser:OrderId>
                    <ser:CardNumber>${cardDetails.cardNumber}</ser:CardNumber>
                    <ser:CardExpiry>${cardDetails.cardExpiry}</ser:CardExpiry>
                    <ser:CardCvv>${cardDetails.cardCvv}</ser:CardCvv>
                    <ser:VPosMessage>
                        <ser:APIVersion>TDV2.0.0</ser:APIVersion>
                        <ser:HashData>${hashData}</ser:HashData>
                        <ser:TransactionType>Sale</ser:TransactionType>
                        <ser:TransactionSecurity>3</ser:TransactionSecurity>
                    </ser:VPosMessage>
                </ser:request>
            </ser:ProcessPayment>
        </soapenv:Body>
    </soapenv:Envelope>`;

    return await sendRequest(xmlData);
};

export const confirmPaymentRequest = async (orderId, amount, md) => {
    const hashData = getHashData(orderId, amount);
    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://boa.net/BOA.Integration.VirtualPos/Service">
        <soapenv:Header/>
        <soapenv:Body>
            <ser:ProcessPayment>
                <ser:request>
                    <ser:IsFromExternalNetwork>true</ser:IsFromExternalNetwork>
                    <ser:CustomerId>${KUVEYT_TURK_CUSTOMER_ID}</ser:CustomerId>
                    <ser:MerchantId>${KUVEYT_TURK_MERCHANT_ID}</ser:MerchantId>
                    <ser:Amount>${amount}</ser:Amount>
                    <ser:OrderId>${orderId}</ser:OrderId>
                    <ser:VPosMessage>
                        <ser:APIVersion>TDV2.0.0</ser:APIVersion>
                        <ser:HashData>${hashData}</ser:HashData>
                        <ser:TransactionType>Sale</ser:TransactionType>
                        <ser:TransactionSecurity>3</ser:TransactionSecurity>
                        <ser:KuveytTurkVPosAdditionalData>
                            <ser:AdditionalData>
                                <ser:Key>MD</ser:Key>
                                <ser:Data>${md}</ser:Data>
                            </ser:AdditionalData>
                        </ser:KuveytTurkVPosAdditionalData>
                    </ser:VPosMessage>
                </ser:request>
            </ser:ProcessPayment>
        </soapenv:Body>
    </soapenv:Envelope>`;

    return await sendRequest(xmlData);
};

export const reversePaymentRequest = async (orderId, amount, provisionNumber, rrn, stan) => {
    const hashData = getHashData(orderId, amount);
    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://boa.net/BOA.Integration.VirtualPos/Service">
        <soapenv:Header/>
        <soapenv:Body>
            <ser:SaleReverse>
                <ser:request>
                    <ser:IsFromExternalNetwork>true</ser:IsFromExternalNetwork>
                    <ser:CustomerId>${KUVEYT_TURK_CUSTOMER_ID}</ser:CustomerId>
                    <ser:MerchantId>${KUVEYT_TURK_MERCHANT_ID}</ser:MerchantId>
                    <ser:Amount>${amount}</ser:Amount>
                    <ser:ProvisionNumber>${provisionNumber}</ser:ProvisionNumber>
                    <ser:OrderId>${orderId}</ser:OrderId>
                    <ser:RRN>${rrn}</ser:RRN>
                    <ser:Stan>${stan}</ser:Stan>
                    <ser:VPosMessage>
                        <ser:APIVersion>TDV2.0.0</ser:APIVersion>
                        <ser:HashData>${hashData}</ser:HashData>
                        <ser:TransactionType>SaleReverse</ser:TransactionType>
                        <ser:TransactionSecurity>3</ser:TransactionSecurity>
                    </ser:VPosMessage>
                </ser:request>
            </ser:SaleReverse>
        </soapenv:Body>
    </soapenv:Envelope>`;

    return await sendRequest(xmlData);
};

export const refundPaymentRequest = async (orderId, amount, provisionNumber, rrn, stan) => {
    const hashData = getHashData(orderId, amount);
    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://boa.net/BOA.Integration.VirtualPos/Service">
        <soapenv:Header/>
        <soapenv:Body>
            <ser:Refund>
                <ser:request>
                    <ser:IsFromExternalNetwork>true</ser:IsFromExternalNetwork>
                    <ser:CustomerId>${KUVEYT_TURK_CUSTOMER_ID}</ser:CustomerId>
                    <ser:MerchantId>${KUVEYT_TURK_MERCHANT_ID}</ser:MerchantId>
                    <ser:Amount>${amount}</ser:Amount>
                    <ser:ProvisionNumber>${provisionNumber}</ser:ProvisionNumber>
                    <ser:OrderId>${orderId}</ser:OrderId>
                    <ser:RRN>${rrn}</ser:RRN>
                    <ser:Stan>${stan}</ser:Stan>
                    <ser:VPosMessage>
                        <ser:APIVersion>TDV2.0.0</ser:APIVersion>
                        <ser:HashData>${hashData}</ser:HashData>
                        <ser:TransactionType>Refund</ser:TransactionType>
                        <ser:TransactionSecurity>3</ser:TransactionSecurity>
                    </ser:VPosMessage>
                </ser:request>
            </ser:Refund>
        </soapenv:Body>
    </soapenv:Envelope>`;

    return await sendRequest(xmlData);
};

export const partialRefundPaymentRequest = async (orderId, amount, provisionNumber, rrn, stan) => {
    const hashData = getHashData(orderId, amount);
    const xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://boa.net/BOA.Integration.VirtualPos/Service">
        <soapenv:Header/>
        <soapenv:Body>
            <ser:PartialRefund>
                <ser:request>
                    <ser:IsFromExternalNetwork>true</ser:IsFromExternalNetwork>
                    <ser:CustomerId>${KUVEYT_TURK_CUSTOMER_ID}</ser:CustomerId>
                    <ser:MerchantId>${KUVEYT_TURK_MERCHANT_ID}</ser:MerchantId>
                    <ser:Amount>${amount}</ser:Amount>
                    <ser:ProvisionNumber>${provisionNumber}</ser:ProvisionNumber>
                    <ser:OrderId>${orderId}</ser:OrderId>
                    <ser:RRN>${rrn}</ser:RRN>
                    <ser:Stan>${stan}</ser:Stan>
                    <ser:VPosMessage>
                        <ser:APIVersion>TDV2.0.0</ser:APIVersion>
                        <ser:HashData>${hashData}</ser:HashData>
                        <ser:TransactionType>PartialRefund</ser:TransactionType>
                        <ser:TransactionSecurity>3</ser:TransactionSecurity>
                    </ser:VPosMessage>
                </ser:request>
            </ser:PartialRefund>
        </soapenv:Body>
    </soapenv:Envelope>`;

    return await sendRequest(xmlData);
};
