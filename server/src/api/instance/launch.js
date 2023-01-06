const puppeteer = require('puppeteer-extra');
const useProxy = require('puppeteer-page-proxy');
const { executablePath } = require('puppeteer');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const path = require("path");
const os = require("os");

puppeteer.use(StealthPlugin());
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export default async (req, res) => {
    try {
        // TODO: Get db row

        const profileRow = {};

        const udd = path.resolve(os.homedir(), 'chrome-browser');
        const userDataDir = path.resolve(udd, String(profileRow.name || Date.now()));

        const LAUNCH_OPTIONS = {
            ...profileRow,
            executablePath: executablePath(),
            userDataDir: userDataDir,
            // chromePath
        };

        const browser = await puppeteer.launch(LAUNCH_OPTIONS);

        const page = await browser.newPage()
        page.goto('https://google.com');

        const pages = await browser.pages();
        await pages[0].close();

        if (profileRow.proxyEnabled) {
            let proxyUrl;

            if (profileRow.proxyAuthEnabled) {
                proxyUrl = `${profileRow.proxyType}://${profileRow.proxyUsername}:${profileRow.proxyPassword}@${profileRow.proxyHost}:${profileRow.proxyPort}`;
            } else {
                proxyUrl = `${profileRow.proxyType}://${profileRow.proxyHost}:${profileRow.proxyPort}`;
            }

            console.log('proxyUrl', proxyUrl)

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
        console.log('e', e);

        res.status(400).send({
            'status': 'error',
            'error': e,
        });
    }
};

module.exports = router;