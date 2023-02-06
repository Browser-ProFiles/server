const LANGS = ['ru', 'en'];
const DEFAULT_LANG = 'ru';

const lang = async (req, res, next) => {
    try {
        let lang = DEFAULT_LANG;

        if (req.query.lang && LANGS.includes(req.query.lang)) {
            lang = req.query.lang;
        } else if (req.acceptsLanguages(...LANGS)) {
            lang = req.acceptsLanguages(...LANGS);
        }

        req.appLang = lang;

        return next();
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: 'Unable to get app lang',
        });
    }
};

module.exports = {
    lang,
};