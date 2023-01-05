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

    await page.evaluateOnNewDocument(() => {
      const newProto = navigator.__proto__;
      delete newProto.webdriver;
      navigator.__proto__ = newProto;
    });

    // Pass the Chrome Test.
    await page.evaluateOnNewDocument(() => {
      // We can mock this in as much depth as we need for the test.
      window.chrome = {
        runtime: {}
      };
    });

    // Pass the Permissions Test.
    await page.evaluateOnNewDocument(() => {
      if (!window.Notification) {
        window.Notification = {
          permission: 'denied'
        }
      }

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.__proto__.query = parameters =>
          parameters.name === 'notifications'
              ? Promise.resolve({state: Notification.permission})
              : originalQuery(parameters);

      // Inspired by: https://github.com/ikarienator/phantomjs_hide_and_seek/blob/master/5.spoofFunctionBind.js
      const oldCall = Function.prototype.call;
      function call() {
        return oldCall.apply(this, arguments);
      }
      Function.prototype.call = call;

      const nativeToStringFunctionString = Error.toString().replace(/Error/g, "toString");
      const oldToString = Function.prototype.toString;

      function functionToString() {
        if (this === window.navigator.permissions.query) {
          return "function query() { [native code] }";
        }
        if (this === functionToString) {
          return nativeToStringFunctionString;
        }
        return oldCall.call(oldToString, this);
      }
      Function.prototype.toString = functionToString;
    });

    // Pass the Plugins Length Test.
    await page.evaluateOnNewDocument(() => {
      // Overwrite the `plugins` property to use a custom getter.
      Object.defineProperty(navigator, 'plugins', {
        // This just needs to have `length > 0` for the current test,
        // but we could mock the plugins too if necessary.
        get: () => [1, 2, 3, 4, 5]
      });
    });

    // Pass the Languages Test.
    await page.evaluateOnNewDocument(() => {
      // Overwrite the `languages` property to use a custom getter.
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
      });
    });

    // Pass the iframe Test
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
        get: function() {
          return window;
        }
      });
    });

    // Pass toString test, though it breaks console.debug() from working
    await page.evaluateOnNewDocument(() => {
      window.console.debug = () => {
        return null;
      };
    });

    const page = await browser.newPage()
    page.goto('about:blank');

    const pages = await browser.pages();
    console.log('pages', pages)
    await pages[0].close();

    for (const page of pages) {
      await page.evaluateOnNewDocument(() => {
        const errors = { Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError };
        for (const name in errors) {
          globalThis[name] = (function(NativeError) {
            return function(message) {
              const err = new NativeError(message);
              const stub = {
                message: err.message,
                name: err.name,
                toString: () => err.toString(),
                get stack() {
                  const lines = err.stack.split('\n');
                  lines.splice(1, 1); // remove anonymous function above
                  lines.pop(); // remove puppeteer line
                  return lines.join('\n');
                },
              };
              if (this === globalThis) {
                // called as function, not constructor
                stub.__proto__ = NativeError;
                return stub;
              }
              Object.assign(this, stub);
              this.__proto__ = NativeError;
            };
          })(errors[name]);
        }
      });
    }

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
