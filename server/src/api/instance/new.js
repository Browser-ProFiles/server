const path = require('path');
const os = require ('os');
const express = require('express');
const puppeteer = require('puppeteer-extra');
const useProxy = require('puppeteer-page-proxy');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const { executablePath } = require('puppeteer');
const FLAG_MAP = require('../../mappers/flagMappers');

puppeteer.use(StealthPlugin());
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const body = req.body;

    const udd = path.resolve(os.homedir(), 'chrome-browser');
    const userDataDir = path.resolve(udd, String(body.name || Date.now()));

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

    const LAUNCH_OPTIONS = {
      headless: false,
      devtools: true,
      ignoreDefaultArgs: true,
      ignoreHTTPSErrors: true,
      executablePath: executablePath(),
      product: 'chrome',
      slowMo: 0,
      userDataDir: userDataDir,
      args: FLAGS,
      env: ENV_VARS,
      // executablePath: ''
      // logLevel: 'verbose',
      // chromePath
    };

    const browser = await puppeteer.launch(LAUNCH_OPTIONS);

    const page = await browser.newPage()
    page.goto('about:blank');

    const pages = await browser.pages();
    console.log('pages', pages)
    await pages[0].close();

    if (body.proxyEnabled) {
      let proxyUrl;

      if (body.proxyAuthEnabled) {
        proxyUrl = `${body.proxyType}://${body.proxyUsername}:${body.proxyPassword}@${body.proxyHost}:${body.proxyPort}`;
      } else {
        proxyUrl = `${body.proxyType}://${body.proxyHost}:${body.proxyPort}`;
      }

      const pages = await browser.pages();
      for (const page of pages) {
        await useProxy(page, proxyUrl);
      }

      browser.on('targetcreated', async (target) => {
        const page = await target.page();
        if (!page) return;

        await useProxy(page, proxyUrl);
      });
    }

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
