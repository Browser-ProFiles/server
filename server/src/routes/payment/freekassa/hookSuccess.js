module.exports = async (req, res) => {
    try {
        console.log('HOOK SUCCESS', req);

        res.json({
            status: 'success',
        });
    } catch (e) {
        console.error(e);

        res.status(400).send({
            status: 'error',
            message: e,
        });
    }
}
