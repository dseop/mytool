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
    } else { return 'there is no Element' }
}

// scroll page to end: sumSn을 기준으로 실행
async function real() {
    try {

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

        const loader = await driver.findElement(webdriver.By.css('div.loader')); // 스크롤한 후에 로딩은 20개씩 됨
        let countScroll = 0;
        for (countScroll; countScroll < Math.ceil((maxSn - 20) / 20); countScroll++) { // Math.ceil(): 소수점 1의 자리 올림 // 나중에 수정 필요
            // break; // 테스트용. 임시로 넣어둔 것 <------------------- 스크롤 없애기
            try {
                await driver.executeScript('arguments[0].scrollIntoView();', loader); // scrollIntoView() 메서드: 해당 요소가 현재 뷰포트에서 보이도록 스크롤
            } catch (err) {
                console.log(err);
            }

            const waitTime = Math.floor(Math.random() * 2) + 0.5; // 0.5~1.5 사이의 랜덤한 정수 생성
            await driver.sleep(waitTime * 1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)
        }
        console.log(countScroll, 'scrolled!');

        // 파일로 문자열 저장
        // const allScrollHtml = await driver.getPageSource();
        // fs.writeFile('allScroll.html', allScrollHtml, (err) => {
        //   if (err) {
        //     console.error(err);
        //   } else {
        //     console.log('페이지 소스코드가 저장되었습니다.');
        //   }
        // });
        // const allScrollHtml = fs.readFileSync('allScroll.html', 'utf-8');

        const allScrollItems = await driver.findElements(webdriver.By.className('item_link')) // findElements(): WebElement 객체 반환. DOM element 정보, 조작.
        
        // double check
        if (allScrollItems.length === sumSn) { 
            console.log('allScrollItems - sumSn이 일치.')
        } else { console.log(`allScrollItems <-> sumSn 불일치, ${allScrollItems.length}개의 정보를 수집합니다.`)} // 공인중개사협회매물 때문에 불일치. 다 수집. 노 상관

        // allScrollItems 수 만큼 반복
        let extractedDatas = []
        
        for (let i = 0; i < allScrollItems.length; i++) {
            console.log(`crawling ${i+1} estate`);

            // Click
            await allScrollItems[i].click();
            console.log('2초 기다린다... 여기서 로딩이 실패하면 망하는 거임'); // error 가능성 있음
            await driver.sleep(2000);
            let readyState = await driver.executeScript('return document.readyState');
            while (readyState !== 'complete') {
                console.log('2초 더 기다린다...'); // error 가능성 있음
                await driver.sleep(2000);
                readyState = await driver.executeScript('return document.readyState');
            }
            await driver.wait(webdriver.until.elementLocated(webdriver.By.className('detail_panel')), 2000);
            
            // crawling
            let detailPanel = await driver.findElement(webdriver.By.className('detail_panel'));
            let detailHtml = await detailPanel.getAttribute('innerHTML');
            let detailDom = new JSDOM(detailHtml);
            let document = detailDom.window.document;

            let extractedData = {};

            // MainInfo
            extractedData['MainInfo'] = {
            '확인': isElementFound(document.querySelector('.data')).textContent,
            '건물종류': isElementFound(document.querySelector('.info_title_name')).textContent.trim(),
            '층': isElementFound(document.querySelector('.info_title')).childNodes[2].textContent.trim(),
            '매물종류': isElementFound(document.querySelector('.info_title')).childNodes[4].textContent.trim(),
            '가격': isElementFound(document.querySelector('.price')).textContent.trim(),
            '중개사': isElementFound(document.querySelector('.name')).textContent,
            '번호': isElementFound(document.querySelector('.number')).textContent
            };

            console.log(extractedData['MainInfo']);

            // detailBoxSummary
            const detailBoxSummary = document.querySelector('.detail_box--summary');
            const trElements = detailBoxSummary.querySelectorAll('.info_table_item');
            trElements.forEach(tr => {
            const th = tr.querySelector('.table_th').textContent;
            const td = tr.querySelector('.table_td').textContent;
            extractedData[th] = td;
            });

            // architectureInfo
            const architectureInfo = document.querySelectorAll('.architecture_list_item');
            architectureInfo.forEach(li => {
            const em = li.querySelector('.architecture_item_title').textContent;
            const span = li.querySelector('.architecture_item_text').textContent;
            extractedData[em] = span;
            });

            // push to array
            extractedDatas.push(extractedData);          

            // break; // 테스트용. 임시로 넣어둔 것 <------------------- 반복 없애기

            // 시간 차 두고 반복
            const waitTime = Math.floor(Math.random() * 2) + 0.5; // 0.5~1.5 사이의 랜덤한 정수 생성
            await driver.sleep(waitTime * 1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)    
        }
        
        // array to json
        const jsonResults = JSON.stringify(extractedDatas);
        console.log(`jsonResults에 총 ${jsonResults.length}개의 매물이 입력되었습니다.`)

        // 파일에 JSON 문자열 저장
        fs.writeFile('data.json', jsonString, (err) => {
            if (err) {
            console.error(err);
            return;
            }
            console.log('JSON 파일이 저장되었습니다.');
        });
        // console.log(jsonResults)

        await driver.quit(); // 브라우저 종료
    } catch (err) {
        console.error(err);
        await driver.quit();
    }
}

real();

// 원하는 형태로 보여주기 ---> React App에서 실습 ---> showJson.js


// 실제 동작 때는 break; 찾아서 없애기 <-------------------