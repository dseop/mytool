const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')
const chromedriver = require('chromedriver');
const { JSDOM } = require('jsdom');
const fs = require('fs');

var cookieParser = require('cookie-parser');
var logger = require('morgan');

let options = new chrome.Options();
options.addArguments('headless'); // Chrome을 headless 모드로 실행

// Chrome 드라이버 생성
const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

// get url -> html
async function urlToHtml() {
    
    let targetUrl = 'https://new.land.naver.com/houses?ms=37.5538871,126.9071715,17&a=VL:DDDGG:JWJT:SGJT:HOJT&b=B1:A1&e=RETAIL&g=30000&j=10&q=TWOROOM';
    await driver.get(targetUrl);
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css('div.loader')), 5000);
    
    const loader = await driver.findElementAll(webdriver.By.css('div.loader'));
    await driver.findElement(webdriver.By.className('detail_contents_inner'));




    console.log(targetUrl)

}

urlToHtml()