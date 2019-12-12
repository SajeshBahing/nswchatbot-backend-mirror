const Screenshot = require('url-to-screenshot');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');

export function takeScreenshot(site) {
    const file = path.join(__dirname, '..', 'capture', uuid()+'.png');

    return new Promise((resolve, reject) => {
        new Screenshot('http://ghub.io/')
        .width(800)
        .height(600)
        .capture()
        .then(img => {

            try {
                fs.writeFileSync(file, img);

                resolve(file);
            } catch(error) {
                reject(error);
            }
        });
    });
}