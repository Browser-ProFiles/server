const db = require('../../../models');
const User = db.user;
const Subscription = db.subscription;
const Payment = db.payment;

const FreekassaService = require('../../../services/freekassa');
const {
    PAYMENT_METHOD_FREEKASSA,
    PAYMENT_STATUS_CREATED,
} = require('../../../const/payment');

module.exports = async (req, res) => {
    try {
        const ip = req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress;

        const apiKey = process.env.FREEKASSA_API_KEY;
        const shopId = process.env.FREEKASSA_SHOP_ID;
        const secretKey1 = process.env.FREEKASSA_SECRET_KEY1;

        if (!apiKey || !shopId || !secretKey1) {
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
            userId: user.id,
            price,
            details: JSON.stringify({ ip }),
            method: PAYMENT_METHOD_FREEKASSA,
            status: PAYMENT_STATUS_CREATED,
        });

        // Number(`${(new Date().getTime() / 1000).toFixed()}${user.id}`)

        const signature = service.getSignature(shopId, price, secretKey1, 'USD', payment.id)

        const link = `https://pay.freekassa.ru/?m=${shopId}&oa=${price}&i=&currency=USD&o=${payment.id}&s=${signature}&em=${user.email}`;

        res.json({
            status: 'success',
            location: link,
        });
    } catch (e) {
        console.error(e.response?.data)
        res.status(400).send({
            status: 'error',
            message: e.message,
        });
    }
}
