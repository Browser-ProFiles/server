const nodemailer = require('nodemailer');

const sendConfirmMail = async (to, token) => {
    let login, password;

    if (process.env.EMAIL_TEST === 'true') {
        const testAccount = await nodemailer.createTestAccount();
        login = testAccount.user;
        password = testAccount.pass;
    } else {
        login = process.env.EMAIL_USERNAME;
        password = process.env.EMAIL_PASSWORD;
    }

    console.log('config', {
        service: "Yandex",
        /*host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports*/
        auth: {
            user: login,
            pass: password,
        },
    })
    const transporter = nodemailer.createTransport({
        service: "Yandex",
        /*host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports*/
        auth: {
            user: login,
            pass: password,
        },
    });

    const confirmUrl = `${process.env.FRONTEND_URL}/auth/confirm/${token}`;

    const info = await transporter.sendMail({
        from: '"Browser ProFiles"',
        to: to,
        subject: "Email Confirmation",
        html: `
            <p style="margin: 0 0 10px 0">Confirm your sign-up:</p>

            <p style="margin: 0">
                <a style="color: #1a8aee; text-decoration: none" href="${confirmUrl}">
                    <span style="color: #1a8aee; text-decoration: underline">${confirmUrl}</span>
                </a>
            </p>
        `
    });
}

module.exports = {
    sendConfirmMail,
};
