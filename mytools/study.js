const webdriver = require('selenium-webdriver');
const chromedriver = require('chromedriver');

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

(async () => {

    const targetUrl = 'https://new.land.naver.com/houses?ms=37.5538871,126.9071715,17&a=VL:DDDGG:JWJT:SGJT:HOJT&b=B1:A1&e=RETAIL&g=30000&j=10&q=TWOROOM&articleNo=2308074354';
    await driver.get(targetUrl);

    console.log('ok');

    let cu = await driver.getCurrentUrl();
    console.log(cu);

    await driver.quit();
})();