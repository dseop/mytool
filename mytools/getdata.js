const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')
const chromedriver = require('chromedriver');
const { JSDOM } = require('jsdom');
const fs = require('fs'); // const fs = require('fs').promises;

let options = new chrome.Options();
options.addArguments('headless'); // Chrome을 headless 모드로 실행

// Chrome 드라이버 생성
const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

// Element가 있는지 확인하는 함수
function isElementFound(element) {
    if (element !== null) {
        return element
    } else { return '' }
}

// scroll page to end: sumSn을 기준으로 실행
async function real() {
    try {
        console.time('runtime');
        // url -> initialHtml
        const targetUrl = 'https://new.land.naver.com/houses?ms=37.5538871,126.9071715,17&a=VL:DDDGG:JWJT:SGJT:HOJT&b=B1:A1&e=RETAIL&g=30000&j=10&q=TWOROOM';
        await driver.get(targetUrl);
        await driver.wait(webdriver.until.elementLocated(webdriver.By.css('div.loader')), 5000);
        const initialHtml = await driver.getPageSource();

        // initialHtml -> sumSn: 최초 화면에서 보이는 전체 항목 개수
        const initailDom = new JSDOM(initialHtml);
        const initailDocument = initailDom.window.document;
        let saleNumbers = initailDocument.querySelectorAll('.sale_number');
        let sumSn = 0;
        saleNumbers.forEach( sns => {
            let sn = parseInt(sns.childNodes[0].textContent, 10)
            sumSn += sn;
            // console.log(`+${sn} = ${sumSn}`);
        });
        console.log(`total search result(sumSn): ${sumSn}`)

        // sumSn -> Scroll -> allScrollItems
        const maxSn = Math.min(150, sumSn); // sumSn과 비교, 최대 Sn값 설정. 너무 많은 경우 다 불러오느라 밤새지 않도록.

        let countScroll = 0;
        console.time('scrollTime');
        for (countScroll; countScroll < Math.ceil((maxSn - 20) / 20); countScroll++) { // Math.ceil(): 소수점 1의 자리 올림 // 나중에 수정 필요
            // break; // 테스트용. 임시로 넣어둔 것 <------------------- 스크롤 없애기
            const loader = await driver.findElement(webdriver.By.css('div.loader')); // 스크롤한 후에 로딩은 20개씩 됨
            await driver.executeScript('arguments[0].scrollIntoView();', loader); // scrollIntoView() 메서드: 해당 요소가 현재 뷰포트에서 보이도록 스크롤
            await driver.sleep(Math.ceil(Math.random() * 1000)+1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)
        }
        
        if (countScroll === 0) { 
            await driver.sleep(Math.ceil(Math.random() * 1000)+1000);
            console.log(countScroll, 'scrolled! --> check "break;" on countScroll section'); 
        } else { 
            console.log(countScroll, 'scrolled!'); 
        };
        console.timeEnd('scrollTime');

        await driver.sleep(2000);
        const allScrollItems = await driver.findElements(webdriver.By.className('item_inner ')); // findElements(): WebElement 객체 반환. DOM element 정보, 조작.
        
        // double check
        if (allScrollItems.length === sumSn) { 
            console.log('allScrollItems - sumSn이 일치.');
        } else { 
            console.log('allScrollItems:', allScrollItems.length, 'sumSn:', sumSn, 'allScrollItems를 수집합니다.');
        };

        // allScrollItems 수 만큼 반복
        let extractedDatas = [];
        let previousUrl = targetUrl
        let currentUrl = '';
        for (let i = 0; i < allScrollItems.length; i++) {
            try {
                console.time('extractingTime');
                console.log(i+1, 'estate click! crawling...');
                
                // click
                let checkLabel = await allScrollItems[i].findElements(webdriver.By.className('label label--cp'));
                let click = '';
                if (checkLabel.length > 0) {
                    click = await checkLabel[0];
                    await click.click();
                } else {
                    click = await allScrollItems[i].findElement(webdriver.By.className('item_link'));
                    await click.click();
                };

                // loading 
                currentUrl = await driver.getCurrentUrl();
                while ( previousUrl === currentUrl ) { // url 변경 체크
                    console.log('more 1 seconds...');
                    await driver.sleep(1000);
                    currentUrl = await driver.getCurrentUrl();
                };
                previousUrl = currentUrl;
                
                try {
                    await driver.wait(webdriver.until.elementLocated(webdriver.By.className('detail_box--summary')), 20000);
                } catch(err) {
                    console.log(err, '\n error. but not give up...');
                    await click.click();
                    await driver.wait(webdriver.until.elementLocated(webdriver.By.className('detail_box--summary')), 20000);
                }
                let readyState = await driver.executeScript('return document.readyState');
                while (readyState !== 'complete') { // 로딩 덜 되는 일을 막기
                    console.log('more 1 seconds...');
                    await driver.sleep(1000);
                    readyState = await driver.executeScript('return document.readyState');
                }

                // crawling: driver -> html -> dom
                let detailPanel = await driver.findElement(webdriver.By.className('detail_panel'));
                let detailHtml = await detailPanel.getAttribute('innerHTML');
                let detailDom = new JSDOM(detailHtml);
                let document = detailDom.window.document;

                // 정보 정리 : MainInfo, detailBoxSummary, architectureInfo
                let extractedData = {};

                extractedData['MainInfo'] = {
                '확인': isElementFound(document.querySelector('.data')).textContent,
                '건물종류': isElementFound(document.querySelector('.info_title_name')).textContent.trim(),
                '층': isElementFound(document.querySelector('.info_title')).childNodes[2].textContent.trim(),
                '매물종류': isElementFound(document.querySelector('.info_title')).childNodes[4].textContent.trim(),
                '가격': isElementFound(document.querySelector('.price')).textContent.trim(),
                '중개사': isElementFound(document.querySelector('.name')).textContent,
                '번호': isElementFound(document.querySelector('.number')).textContent
                };

                const detailBoxSummary = document.querySelector('.detail_box--summary');
                const trElements = detailBoxSummary.querySelectorAll('.info_table_item');
                trElements.forEach(tr => {
                    const ths = tr.querySelectorAll('.table_th');
                    const tds = tr.querySelectorAll('.table_td');
                    for (k=0; k < ths.length; k++) {
                        extractedData[ths[k].textContent] = tds[k].textContent;
                    }
                    // const th = tr.querySelector('.table_th').textContent;
                    // const td = tr.querySelector('.table_td').textContent;
                    // extractedData[th] = td;

                });

                const architectureInfo = isElementFound(document.querySelector('.architecture_info_list'));
                if (architectureInfo !== '') { // architectureIfno Beta 서비스라 그런지 없는 경우가 있음
                    document.querySelectorAll('.architecture_list_item').forEach(li => {
                        const em = li.querySelector('.architecture_item_title').textContent;
                        const span = li.querySelector('.architecture_item_text').textContent;
                        extractedData[em] = span;
                    });
                }

                extractedDatas.push(extractedData);          
                console.timeLog('extractingTime');

                await driver.sleep(Math.ceil(Math.random() * 1000)+1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)

                console.timeEnd('extractingTime');
            } catch(err) {
                console.log(err);
                console.log(currentUrl);
            };
        }
        
        // array to json
        const jsonResults = JSON.stringify(extractedDatas);
        console.log(`jsonResults에 총 ${jsonResults.length}개의 매물이 입력되었습니다.`)

        // 파일에 JSON 문자열 저장
        fs.writeFile('data.json', jsonResults, (err) => {
            if (err) {
            console.error(err);
            return;
            }
            console.log('JSON 파일이 저장되었습니다.');
        });
        // console.log(jsonResults)

        await driver.quit(); // 브라우저 종료
        
    } catch (err) {

        // array to json
        const jsonResults = JSON.stringify(extractedDatas);
        console.log(`jsonResults에 총 ${jsonResults.length}개의 매물이 입력되었습니다.`)

        // 파일에 JSON 문자열 저장
        fs.writeFile('data.json', jsonResults, (err) => {
            if (err) {
            console.error(err);
            return;
            }
            console.log('JSON 파일이 저장되었습니다.');
        });
        // console.log(jsonResults)

        await driver.quit();
        console.error(err, 'quit...');
        console.timeEnd('runtime');
        
    }
}

real();


// 원하는 형태로 보여주기 ---> React App에서 실습 ---> showJson.js

// 실제 동작 때는 break; 찾아서 없애기 <-------------------