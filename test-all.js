const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const dateFormat = require('dateFormat');

const pixelCompare = require('./pixel-compare/pixel-compare');
const tranform = require('./url-tranform').transfom;

(async () => {
    let urls = await getUrls('/input/export.xml').catch(err => {
        console.log(err);  
    });
    
    const now = dateFormat(new Date(), 'dd-mm-yyyy-hhMMss');
    let allResults = [];
    for (let i = 0; i < urls.length; i++) {
        let result = await pixelCompare.compare(
            tranform(urls[i]),
            urls[i],
            0.3,
            now);

        allResults.push(result);
    }

    await saveResultToFile(allResults, now).catch(err => { console.log(err); });
})();

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

async function saveResultToFile(result, formattedDate) {
    let json = JSON.stringify(result);
    let filePath = path.join(__dirname, 'output', 'result-' + formattedDate + '.json')
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