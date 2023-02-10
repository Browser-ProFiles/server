const crypto = require('crypto');

const { PAYMENT_STATUS_SUCCESS } = require('../../../const/payment');

const db = require('../../../models');
const Payment = db.payment;
const User = db.user;
const Subscription = db.subscription;

const FREEKASSA_IP_LIST = [
    '168.119.157.136',
    '168.119.60.227',
    '138.201.88.124',
    '178.154.197.79',
];

module.exports = async (req, res) => {
    try {
        console.log('HOOK', req);

        // TODO: Add check
        /*const ip = req.headers['X-FORWARDED-FOR'] || req.connection.remoteAddress;
        if (!FREEKASSA_IP_LIST.includes(ip)) {
            throw new Error('Access denied');
        }*/

        const shopId = req.body['MERCHANT_ID'];
        const amount = req.body['AMOUNT'];
        const paymentId = req.body['MERCHANT_ORDER_ID'];
        const sign = req.body['SIGN'];
        console.log('shopId', shopId)
        console.log('amount', amount)
        console.log('paymentId', paymentId)
        console.log('sign', sign)
        console.log('req.body', req.body)

        const secret = process.env.FREEKASSA_SECRET_KEY2;
        if (!secret) {
            throw new Error('Incorrect secret');
        }

        const signText = `${shopId}:${amount}:${secret}:${paymentId}`;

        console.log('signText', signText);

        // $sign = md5($merchant_id.':'.$_REQUEST['AMOUNT'].':'.$merchant_secret.':'.$_REQUEST['MERCHANT_ORDER_ID']);
        const signServer = crypto.createHash('md5').update(signText).digest('hex');

        console.log('sign', sign);
        console.log('signServer', signServer);
        if (sign !== signServer) {
            throw new Error('Incorrect sign');
        }

        const payment = await Payment.findOne({
            where: {
                id: paymentId,
            },
        });
        console.log('payment', payment);
        if (!payment) {
            throw new Error('Payment not found');
        }

        console.log('payment.price', payment.price)
        console.log('amount', amount)
        if (Number(payment.price) !== Number(amount)) {
            throw new Error('Incorrect amount');
        }

        await payment.update({
            status: PAYMENT_STATUS_SUCCESS
        });

        const user = await User.findOne({
            attributes: ['id', 'username', 'subscriptionId', 'subscriptionActiveUntil'],
            where: {
                id: payment.userId,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }

        const subscription = await Subscription.findOne({
            where: {
                id: payment.subscriptionId,
            },
        });
        if (!subscription) {
            throw new Error('Subscription not found');
        }
        if (Number(subscription.price) !== Number(amount)) {
            throw new Error('Incorrect amount');
        }

        // +1 month
        const subscriptionActiveUntil = Number(user.subscriptionActiveUntil);
        const currentTime = Number((new Date().getTime() / 1000).toFixed());
        console.log('subscriptionActiveUntil', subscriptionActiveUntil)
        console.log('currentTime', currentTime);

        const oneMonth = 60 * 60 * 24 * 30;

        // TODO: Fix with subscription dates
        let newUntilDate;
        if (subscriptionActiveUntil < currentTime || user.subscriptionId !== subscription.id) {
            newUntilDate = currentTime + oneMonth;
        } else {
            newUntilDate = currentTime + oneMonth;
        }

        console.log('currentTime', currentTime);
        console.log('oneMonth', oneMonth);
        console.log('newUntilDate', newUntilDate);
        await user.update({
            subscriptionId: subscription.id,
            subscriptionActiveUntil: newUntilDate,
        });

        console.log('SUCCESS');

        res.send('SUCCESS');
    } catch (e) {
        console.error('error', e);

        res.status(400).send({
            status: 'error',
            message: e,
        });
    }
}
