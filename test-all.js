const pixelCompare = require('./pixel-compare/pixel-compare');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const dateFormat = require('dateFormat');

(async () => {
    let urls = await getUrls('/input/export.xml').catch(err => {
        console.log(err);  
    });
    
    let allResults = [];
    for (let i = 0; i < urls.length; i++) {
        let result = await pixelCompare.compare(
            urls[i].replace(/^https:\/\/www/, 'https://dev'),
            urls[i])

        allResults.push(result);
    }

    await saveResultToFile(allResults).catch(err => { console.log(err); });
})();

async function runAgainstAllUrls(pages) {
    let res = await pixelCompare.compare(
        'https://dev.beyondblue.org.au/get-support/get-immediate-support/',
        'https://www.beyondblue.org.au/get-support/get-immediate-support/')
        //'https://google.bg', 'https://google.bg')
        .catch(err => {
            console.log(err);
        });

    console.log(res);
}

async function getUrls(filePath) {
    let parser = new xml2js.Parser();

    let promise = new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, filePath), (err, data) => {
            parser.parseString(data, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    let urlsOnly = [];
                    for (let i = 0; i < result.urlset.url.length; i++) {
                        urlsOnly.push(result.urlset.url[i].loc[0]);
                    }

                    resolve(urlsOnly);
                }
            });
        });
    });

    return promise;
}

async function saveResultToFile(result) {
    let json = JSON.stringify(result);
    let filePath = path.join(__dirname, 'output', 'result-' + dateFormat(new Date(), 'ddMMyyyy-hhmmss') + '.json')
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, json, 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}