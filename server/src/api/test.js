const path = require('path');
const os = require ('os');
const express = require('express');
const ChromeLauncher = require('chrome-launcher');
const proxyChain = require('proxy-chain');

const router = express.Router();

router.get('/', async (req, res) => {
  const udd = path.resolve(os.homedir(), 'chrome-browser');
  const upd = path.resolve(udd, String(Date.now()));

  console.log('udd', udd)
  console.log('upd', upd)
  const DEFAULT_FLAGS = [
    /*
    '--display:1',
    '--use-gl=egl',
    */
    '--window-size=1440,900',
    '--profiling-flush=1000',
    '--enable-aggressive-domstorage-flushing',
    '--restore-last-session',
    '--disk-cache-size=2750000000',
    `--profile-directory="${upd}"`,
    `--TZ=America/New_York`,
    `--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 RuxitSynthetic/1.0 v2217040525507162841 t7086931467519268475 ath5ee645e0 altpriv cvcv=2 smf=0`
  ];

  const proxy = '45.132.79.189:8000';

  ChromeLauncher.launch({
    chromeFlags: [...DEFAULT_FLAGS, `--proxy-server=${proxy}`],
    logLevel: 'verbose'
  }).then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
  });

  res.json({
    'status': 'check console'
  });
});

module.exports = router;
