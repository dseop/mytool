const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')
const chromedriver = require('chromedriver');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;

let options = new chrome.Options();
options.addArguments('headless'); // Chrome을 headless 모드로 실행

// Chrome 드라이버 생성
const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();


function isElementFound(element) {
    if (element !== null) {
        return element
    } else { return 'there is no Element' }
}

const html = await fs.readFile('page.html', 'utf-8');
async function myAsyncFunction() {
    try {
        // 파일 읽기
        const html = await fs.readFile('page.html', 'utf-8');

        // HTML 코드를 DOM 객체로 변환
        const dom = new JSDOM(html);
        const document = dom.window.document;

        let checkDate = isElementFound(document.querySelector('.data')).textContent;

        let infoTitle = isElementFound(document.querySelector('.info_title')); //
        let infoTitleName = isElementFound(infoTitle.querySelector('.info_title_name')).textContent.trim();
        let floor = infoTitle.childNodes[2].textContent.trim();
        let rentType = infoTitle.childNodes[4].textContent.trim();
        let price = isElementFound(infoTitle.querySelector('.price')).textContent.trim();

        let name = isElementFound(document.querySelector('.name')).textContent;
        let telNumber = isElementFound(document.querySelector('.number')).textContent;

        let extractedData = [];

        extractedData.push({["확인"]: checkDate});
        extractedData.push({["건물종류"]: infoTitleName});
        extractedData.push({["층"]: floor});
        extractedData.push({["매물종류"]: rentType});
        extractedData.push({["가격"]: price});
        extractedData.push({["중개사"]: name});
        extractedData.push({["번호"]: telNumber});

        const trElements = document.querySelectorAll('.info_table_item');
        trElements.forEach(tr => {
            const th = tr.querySelector('.table_th').textContent;
            const td = tr.querySelector('.table_td').textContent;
            extractedData.push({[th]: td});
        });

        const architectureInfo = document.querySelectorAll('.architecture_list_item');
        architectureInfo.forEach(li => {
            const em = li.querySelector('.architecture_item_title').textContent;
            const span = li.querySelector('.architecture_item_text').textContent;
            extractedData.push({[em]: span});
        });
        
        const jsonResult = JSON.stringify(extractedData);
        console.log(jsonResult)

        await driver.quit(); // 브라우저 종료
        console.log("ok")

    } catch (err) {
        console.error(err);
    }
}

myAsyncFunction();
