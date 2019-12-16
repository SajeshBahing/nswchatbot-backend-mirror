const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

export function takeScreenshot(name, site) {
    const file = path.join(__dirname, '..' , 'capture', name + '.jpg');
    console.log(site);
    console.log(file);

    return new Promise(async (resolve, reject) => {
        try {
            if (fs.existsSync(file)) {
                console.log("File already exists");
                resolve(file);
            } else {
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
                    await page.screenshot({ path: file, width: 1024, height: 700 });
                    resolve(file);
                }, 3000);
            }
        } catch (error) {
            reject(error);
        }
    });
}

export function filePathToUrl(path) {

}