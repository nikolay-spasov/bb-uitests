const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

let driver = createDriver();
console.log(driver);


function createDriver() {
    return new webdriver.Builder()
        .forBrowser('phantomjs')
        .build();
}
