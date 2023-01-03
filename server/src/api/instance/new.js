const path = require('path');
const os = require ('os');
const express = require('express');
const ChromeLauncher = require('chrome-launcher');
const proxyChain = require('proxy-chain');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const body = req.body;

    const udd = path.resolve(os.homedir(), 'chrome-browser');
    const upd = path.resolve(udd, String(body.name || Date.now()));

    // todo: session storage (cookies), extensions, apps, webgl, canvas, -> article, memory, screen
    // then -> checkers

    const FLAGS = [
      '--profiling-flush=1000',
      '--enable-aggressive-domstorage-flushing',
      '--restore-last-session',
      '--disk-cache-size=2750000000',
      `--profile-directory="${upd}"`,

      // When the 3D api's are disabled, LightningChart JS will fail to render and will throw an error.
      // @see https://stackoverflow.com/questions/59928635/enable-or-disable-webgl
      '--disable-3d-apis',
      '--disable-webgl',
      '--guest'
    ];

    const PREFS = {};
    const ENV_VARS = {};

    if (body.screen) {
      FLAGS.push(`--window-size=${body.screen.width},${body.screen.height}`);
    }

    if (body.system.timezone) {
      ENV_VARS['TZ'] = body.system.timezone;
    }

    if (body.system.language) {
      FLAGS.push(`--accept-lang=${body.system.language}`);
    }

    if (body.identity.siteIsolation) {
      FLAGS.push('--enable-site-per-process');
    }

    if (body.identity.userAgent) {
      FLAGS.push(`--user-agent=${body.identity.userAgent}`);
    }

    if (body.proxy.enabled) {
      FLAGS.push(`--proxy-server=${body.proxy.host}:${body.proxy.port}`);
    }

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
    res.status(400).send({
      'status': 'error',
      'error': e,
    });
  }
});

module.exports = router;
