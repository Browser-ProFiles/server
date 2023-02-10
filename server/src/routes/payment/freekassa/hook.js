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

        console.log('SUCCESS');

        res.json({
            status: 'success',
        });
    } catch (e) {
        console.error('error', e);

        res.status(400).send({
            status: 'error',
            message: e,
        });
    }
}
