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
async function urlToHtml(url) {

    await driver.get(targetUrl);

}


async function myAsyncFunction() {

    let targetUrl = 'https://new.land.naver.com/houses?ms=37.5538871,126.9071715,17&a=VL:DDDGG:JWJT:SGJT:HOJT&b=B1:A1&e=RETAIL&g=30000&j=10&q=TWOROOM';
    
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css('div.loader')), 5000);
    // driver.wait(): 조건을 기다리며 대기. 대기한 시간과 충족한 결과를 반환.
    // webdriver.until.elementLocated(): 인수로 전달된 Locator로 DOM 요소가 생성될 때를 기다림
    // webdriver.By.css(): DOM 요소를 찾는 Locator 객체

    const loader = await driver.findElement(webdriver.By.css('div.loader'));
    // driver.findElement(): 인수로 전달된 Locator로 DOM 요소를 검색, WebElement 객체(첫 번째 DOM 요소)를 반환        
    
    try {
        // loader가 로드될 때까지 대기    
        await driver.wait(webdriver.until.elementIsVisible(loader), 2000);

    } catch (err) {

        if (err.name === 'TimeoutError') {

            console.error('TimeoutError occurred while waiting for element to be visible:', err);

        } else {

            console.error('Error occurred while waiting for element to be visible:', err);

        }

    }

    // 스크롤 반복
    for (let i = 0; i < 1; i++) { 
        try {
            await driver.executeScript('arguments[0].scrollIntoView();', loader);
            // scrollIntoView() 메서드: 해당 요소가 현재 뷰포트에서 보이도록 스크롤
        } catch (err) {
        }
        const waitTime = Math.floor(Math.random() * 2) + 0.5; // 0.5~1.5 사이의 랜덤한 정수 생성
        await driver.sleep(waitTime * 1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)
    }

    // 부동산 정보 불러오기
    const elements = await driver.findElements(webdriver.By.className('item_link'));


    for (let i = 0; i < 1; i++) { // elements.length
        
        // 클릭해서 펼치기
        await elements[i].click();
        await driver.wait(webdriver.until.elementLocated(webdriver.By.className('detail_tabpanel')), 2000);

        // 페이지 컨텐츠 가져오기
        const detailContentsInner = await driver.findElement(webdriver.By.className('detail_contents_inner'));
        
        const mainInfoArea = await driver.executeScript("return document.querySelector('.main_info_area')", detailContentsInner);
        const detailBoxSummary = await driver.executeScript("return document.querySelector('.detail_box--summary')", detailContentsInner);
        const detailBoxLedger = await driver.executeScript("return document.querySelector('.detail_box--ledger')", detailContentsInner);        
        /////////////////////////////////////// ************************************
        //여기 executeScript라고 된 이유를 알았다. 원래는 window 객체를 담은 document객체를 새로 만들어서 document에 저장하고
        //그걸 가지고 querySelector 같은 작업을 했어야 했는데 여기서는 그냥 Webdriver에서 처리하고 있구나

        // const mainInfoAreaText = await driver.executeScript("return arguments[0].textContent", mainInfoArea);
        // const detailBoxSummaryText = await driver.executeScript("return arguments[0].textContent", detailBoxSummary);
        // const detailBoxLedgerText = await driver.executeScript("return arguments[0].textContent", detailBoxLedger);

        const mainInfoAreaHtml = await driver.executeScript("return arguments[0].outerHTML", mainInfoArea);
        const detailBoxSummaryHtml = await driver.executeScript("return arguments[0].outerHTML", detailBoxSummary);
        const detailBoxLedgerHtml = await driver.executeScript("return arguments[0].outerHTML", detailBoxLedger);    
        
        // HTML 코드 문자열로 합치기
        // const html = mainInfoAreaHtml + detailBoxSummaryHtml + detailBoxLedgerHtml;
        
        // 파일에 문자열 저장
        // fs.writeFile('page.html', html, (err) => {
        //   if (err) {
        //     console.error(err);
        //   } else {
        //     console.log('페이지 소스코드가 저장되었습니다.');
        //   }
        // });

        console.log(mainInfoAreaHtml);
        console.log(detailBoxSummaryHtml);
        console.log(detailBoxLedgerHtml);

        const waitTime = Math.floor(Math.random() * 2) + 0.5; // 0.5~1.5 사이의 랜덤한 정수 생성
        await driver.sleep(waitTime * 1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)    

    }

    await driver.quit(); // 브라우저 종료
}

myAsyncFunction();