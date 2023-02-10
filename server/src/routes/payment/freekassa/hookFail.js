module.exports = async (req, res) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL;

        res.redirect(`${frontendUrl}/payment?status=fail`);
    } catch (e) {
        console.error(e);

        res.status(400).send({
            status: 'error',
            message: e,
        });
    }
}
