const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const imageDiff = require('image-diff');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

async function takeScreenshot(url, filename) {
    driver = createDriver();
    driver.manage().window().setSize(1024, 768);
    await driver.get(url);
    // Selenium will wait for document.ready event by defaults, but for some pages
    // this is not enough because we have to wait for external resources to load and initialize e.g. yt videos
    // TODO: wait interval


    // https://stackoverflow.com/a/16882197
    const data = await driver.takeScreenshot();
    const base64Data = data.replace(/^data:image\/png;base64,/, "");
    await fs.writeFile(filename, base64Data, 'base64', err => {
        return new Promise((resolve, reject) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    await driver.quit();
}

async function compare(urlDev, urlProd) {
    const dirname = createTestNameFromUrl(urlDev);
    const dev = path.join(dirname, 'dev.png');
    const prod = path.join(dirname, 'prod.png');
    const diff = path.join(dirname, 'diff.png');
    console.log(dev);
    console.log(prod);
    console.log(diff);

    await takeScreenshot(urlDev, dev).catch(err => {
        console.log(err);
    });
    await takeScreenshot(urlProd, prod).catch(err => {
        console.log(err);  
    });

    return new Promise(async (resolve, reject) => {
        const result = await generateDiff(dev, prod, diff).catch(err => {
            reject(err);
        });

        let returnVal = {
            result: result,
            prodPath: prod,
            devPath: dev,
            diffPath: diff,
            testedUrl: urlProd,
            testStatus: result.percentage > 0.3
        };

        resolve(returnVal);
    });
}

async function generateDiff(actual, expected, diff) {
    return new Promise((resolve, reject) => {
            imageDiff.getFullResult({
                actualImage: actual,
                expectedImage: expected,
                diffImage: diff
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
}

function createTestNameFromUrl(url) {
    const folderPath = path.join(__dirname, '../res');
    //const folderPath = path.join(__dirname, '..', uuid.v4());

    if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath);
    }
    return folderPath;
}

function createDriver() {
    return new webdriver.Builder()
        .forBrowser('phantomjs')
        .build();
}

exports.compare = compare;