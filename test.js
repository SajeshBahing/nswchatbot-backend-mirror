const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function takeScreenshot(name, site) {
    const file = path.join(__dirname, 'capture', name + '.jpg');

    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setViewport({
                width: 1024,
                height: 700,
                deviceScaleFactor: 1,
            });

            page.goto(site).then(async () => {
                await browser.close();
            }).catch((error) => { console.log(error) });
            
            setTimeout(async () => {
                console.log("After 2 seconds");
                await page.screenshot({ path: file, width: 1024, height: 700 });

            }, 3000);
        } catch (error) {
            reject(error);
        }
    });
}

takeScreenshot('youtube', 'https://counsellorsam1.wordpress.com/')