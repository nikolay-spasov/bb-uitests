const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const imageDiff = require('image-diff');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const replaceAll = require('./utils').replaceAll;

const resolution = {
    width: 1024,
    height: 768
};

async function takeScreenshot(url, filename) {
    driver = createDriver();
    driver.manage().window().setSize(resolution.width, resolution.height);
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

async function compare(urlDev, urlProd, successTreshold, formattedDate) {
    const dirname = createTestNameFromUrl(urlDev, formattedDate);
    const dev = path.join(dirname, 'dev.png');
    const prod = path.join(dirname, 'prod.png');
    const diff = path.join(dirname, 'diff.png');

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

        const returnVal = {
            percentage: result.percentage,
            imagesWidth: resolution.width,
            imagesHeight: resolution.height,
            prodPath: filePathToRelativeUrl(prod),
            devPath: filePathToRelativeUrl(dev),
            diffPath: filePathToRelativeUrl(diff),
            testedUrl: urlProd,
            testStatus: result.percentage < successTreshold
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

function createTestNameFromUrl(url, formattedDate) {
    const folderPath = path.join(__dirname, '../public/images/screenshots', formattedDate);

    if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath);
    }
    
    const id = uuid.v4();
    const finalPath = path.join(folderPath, id)
    fs.mkdirSync(finalPath);

    return finalPath;
}

function createDriver() {
    return new webdriver.Builder()
        .forBrowser('phantomjs')
        .build();
}

function filePathToRelativeUrl(p) {
    let result = p.replace(path.join(__dirname, '../'), '');
    result = replaceAll(result, '\\', '/')
    return result;
}

exports.compare = compare;