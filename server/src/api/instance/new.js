const path = require('path');
const os = require ('os');
const express = require('express');
const ChromeLauncher = require('chrome-launcher');
const proxyChain = require('proxy-chain');

const FLAG_MAP = require('../../mappers/flagMappers');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const body = req.body;

    const udd = path.resolve(os.homedir(), 'chrome-browser');
    const upd = path.resolve(udd, String(body.name || Date.now()));

    const FLAGS = [
      '--profiling-flush=1000',
      '--enable-aggressive-domstorage-flushing',
      '--restore-last-session',
      '--disk-cache-size=2750000000',
      `--profile-directory="${upd}"`,
      '--guest'
    ];

    const PREFS = {};
    const ENV_VARS = {};

    // Manual settings
    if (body.width && body.height) {
      FLAGS.push(`--window-size=${body.width},${body.height}`);
    }

    if (body.timezone) {
      ENV_VARS['TZ'] = body.timezone;
    }

    if (body.proxyEnabled) {
      FLAGS.push(`--proxy-server=${body.proxyHost}:${body.proxyPort}`);
      // TODO: proxyAuthEnabled
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
    })

    console.log('FLAGS', FLAGS)

    ChromeLauncher.launch({
      chromeFlags: FLAGS,
      prefs: PREFS,
      envVars: ENV_VARS,
      logLevel: 'verbose',
      ignoreDefaultFlags: true
    }).then(chrome => {
      console.log(`Chrome debugging port running on ${chrome.port}`);
    });

    res.json({
      'status': 'success'
    });
  } catch (e) {
    console.log('e', e)
    res.status(400).send({
      'status': 'error',
      'error': e,
    });
  }
});

module.exports = router;
