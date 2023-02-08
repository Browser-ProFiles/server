const nodemailer = require('nodemailer');

const sendConfirmMail = async (to, token, lang) => {
    let login, password;

    if (process.env.EMAIL_TEST === 'true') {
        const testAccount = await nodemailer.createTestAccount();
        login = testAccount.user;
        password = testAccount.pass;
    } else {
        login = process.env.EMAIL_USERNAME;
        password = process.env.EMAIL_PASSWORD;
    }

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : null,
        // secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: login,
            pass: password,
        },
    });

    const confirmUrl = `${process.env.FRONTEND_URL}/auth/confirm/${token}`;

    const info = await transporter.sendMail({
        from: login,
        to: to,
        subject: lang === 'en' ? 'Email Confirmation' : 'Подтверждение регистрации',
        html: `
            <p style="margin: 0 0 10px 0">
            ${lang === 'en' ? 'Thank you for the registration in ' : 'Спасибо за регистрацию на сайте '}
            <a target="_blank" href="https://browser-profiles.com">browser-profiles.com</a>
            </p>
            <p style="margin: 0 0 10px 0">
            ${
                lang === 'en' ?
                    'You may activate your account by following the link: ' :
                    'Вы можете активировать свой аккаунт, перейдя по ссылке: '
            }
            </p>

            <p style="margin: 0">
                <a style="color: #1a8aee; text-decoration: none" href="${confirmUrl}">
                    <span style="color: #1a8aee; text-decoration: underline">${confirmUrl}</span>
                </a>
            </p>
            
            <p>${
                lang === 'en' ?
                    'If you don\'t sign on this website, simply ignore this message.' :
                    'Если это были не вы, просто проигнорируйте данное письмо. '
            }</p>
            
            <p>© ${(new Date()).getFullYear()} Browser ProFiles</p>
        `
    });
}

module.exports = {
    sendConfirmMail,
};
