const db = require('../../../models');
const User = db.user;
const Subscription = db.subscription;
const Payment = db.payment;

const axios = require('axios');

const FreekassaService = require('../../../services/freekassa');
const {
    PAYMENT_METHOD_FREEKASSA,
    PAYMENT_STATUS_CREATED,
} = require('../../../const/payment');

module.exports = async (req, res) => {
    try {
        const ip = req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress;

        const freekassaUrl = process.env.FREEKASSA_URL;
        const apiKey = process.env.FREEKASSA_API_KEY;
        const shopId = process.env.FREEKASSA_SHOP_ID;

        if (!freekassaUrl || !apiKey || !shopId) {
            throw new Error(req.appLang === 'en' ? 'Incorrect settings' : 'Некорректные настройки');
        }

        const subscriptionId = req.body.subscriptionId;

        const subscription = await Subscription.findOne({
            where: {
                id: subscriptionId,
            },
        });

        if (!subscription) {
            throw new Error(req.appLang === 'en' ? 'Subscription not found' : 'Подписка не найдена');
        }

        const user = await User.findOne({
            attributes: ['id', 'username', 'email', 'ip'],
            where: {
                id: req.user.id,
            },
        });

        if (!user) {
            throw new Error(req.appLang === 'en' ? 'User not found' : 'Пользователь не найден');
        }

        const service = new FreekassaService();
        const price = subscription.price;

        const payment = await Payment.create({
            subscriptionId: subscriptionId,
            method: PAYMENT_METHOD_FREEKASSA,
            price,
            details: JSON.stringify({}),
            status: PAYMENT_STATUS_CREATED,
        });

        const form = {
            amount: price,
            currency: 'USD',
            email: user.email,
            ip: '46.191.138.6',
            i: 6,
            nonce: Number(`${(new Date().getTime() / 1000).toFixed()}${user.id}`),
            paymentId: payment.id,
            shopId: Number(shopId),
        };

        const signature = service.getSignature(form, apiKey);

        console.log('signature', signature)
        console.log('data', {
            ...form,
            paymentId: payment.id,
            signature,
        })

        const { data } = await axios.post(`${freekassaUrl}/orders/create`, {
            ...form,
            paymentId: payment.id,
            signature,
        });

        res.json({
            status: 'success',
            orderId: data.orderId,
            location: data.location,
        });
    } catch (e) {
        console.error(e.response?.data)
        res.status(400).send({
            status: 'error',
            message: e.message,
        });
    }
}
