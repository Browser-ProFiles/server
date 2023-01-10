const db = require('../../models');
const Profile = db.profile;

const FLAG_MAP = require('../../mappers/flagMappers');
const { flat } = require('../../helpers/flat');

module.exports = async (req, res) => {
  try {
    const rawBody = req.body;
    const body = flat(req.body);

    const FLAGS = [
      '--profiling-flush=10',
      '--restore-last-session',
      '--enable-aggressive-domstorage-flushing',
      // '--no-sandbox'
    ];

    const ENV_VARS = {};

    // Manual settings
    if (body.width && body.height) {
      FLAGS.push(`--window-size=${body.width},${body.height}`);
    }

    if (body.timezone) {
      ENV_VARS['TZ'] = body.timezone;
    }

    // Auto settings
    const keys = Object.entries(body);
    keys.forEach(([key, value]) => {
      if (FLAG_MAP[key]) {
        const flag = FLAG_MAP[key];

        if (!value) return;

        if (typeof flag == 'boolean') {
          FLAGS.push(`--${key}`);
          return;
        }

        FLAGS.push(`--${key}=${value}`);
      }
    });

    const data = {
      headless: false,
      devtools: true,
      ignoreDefaultArgs: true,
      ignoreHTTPSErrors: true,
      product: 'chrome',
      slowMo: 0,
      args: FLAGS,
      env: ENV_VARS,
      // executablePath: ''
      // logLevel: 'verbose',
      // chromePath
    };

    const hasWithSameName = await Profile.findOne({
      where: {
        userId: req.user.id,
        name: body.name,
      },
    });

    if (hasWithSameName) {
      res.status(400).send({
        status: 'error',
        message: 'Profile with same name already exists.',
      });
    }

    await Profile.create({
      userId: req.user.id,
      name: body.name || Date.now(),
      options: JSON.stringify(data),
      form: JSON.stringify(rawBody),
    });

    res.json({
      status: 'success',
      data,
    });
  } catch (e) {
    console.error(e)

    res.status(400).send({
      status: 'error',
      message: e,
    });
  }
};
