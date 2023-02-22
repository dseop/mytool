const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')
const chromedriver = require('chromedriver');
const { JSDOM } = require('jsdom');
const fs = require('fs');

let options = new chrome.Options();
// options.addArguments('headless'); // Chrome을 headless 모드로 실행

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

// get html from url
let targetUrl = 'https://new.land.naver.com/houses?ms=37.5538871,126.9071715,17&a=VL:DDDGG:JWJT:SGJT:HOJT&b=B1:A1&e=RETAIL&g=30000&j=10&q=TWOROOM';

async function urlToHtml(targetUrl) {
    await driver.get(targetUrl);
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css('div.loader')), 5000);

    
}
    

// get html from file
const html = fs.readFileSync('test.html', 'utf-8');
// .readFileSync(): 동기적으로 파일을 읽어오는 메서드

// const html = await fs.readFile('page.html', 'utf-8');
// .readFile(): 비동기적으로 파일을 읽어옴. 비동기함수 안에서 이 작업을 동기적으로 돌아가게 하기 위해 await가 붙음


// check number of saling house
function checkTotal(html) {
    const dom = new JSDOM(html); // 여기서 입력한 html은 최초 화면. 실제 작업할 html이 아님
    const document = dom.window.document;
    
    let saleNumbers = document.querySelectorAll('.sale_number');
    let sumSn = 0;
    saleNumbers.forEach( sns => {
        let sn = parseInt(sns.childNodes[0].textContent, 10)
        sumSn += sn;
        console.log(`+${sn} = ${sumSn}`);
    });
    console.log(`*total search result: ${sumSn}`)
    
    return sumSn;
}

const sumSn = checkTotal(html)

// scroll page to end
async function scrollPage(html, sumSn) {
    try {

        const loader = await driver.findElement(webdriver.By.css('div.loader'));
        const maxSn = Math.min(150, sumSn); // sumSn과 비교, 최대 Sn값 설정. 너무 많은 경우 다 불러오느라 밤새지 않도록.
        
        for (let i = 0; i < Math.ceil((maxSn - 20) / 20); i++) { // (mumSn-20)/20 결과를 소수점 1의 자리에서 roundup, 반복 // 최초 로드: 20개 -> ('.item   false') // 추가 로드: 20개 -> 'div.loader'
            try {
                await driver.executeScript('arguments[0].scrollIntoView();', loader); // scrollIntoView() 메서드: 해당 요소가 현재 뷰포트에서 보이도록 스크롤
            } catch (err) {
                console.log(err)
            }

            const waitTime = Math.floor(Math.random() * 2) + 0.5; // 0.5~1.5 사이의 랜덤한 정수 생성
            await driver.sleep(waitTime * 1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)
        }
        


        // 파일에 문자열 저장
        fs.writeFile('allScroll.html', html, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('페이지 소스코드가 저장되었습니다.');
          }
        });

        // click
        // 다 불러왔다면 전체 자료를 하나씩 클릭 시작



        // 클릭한 다음 불러오는 함수는 아래에 정의해둠.
        await driver.quit(); // 브라우저 종료
    } catch (err) {
        console.error(err);
    }
}

scrollPage(html, sumSn);



// 상세화면 html 입력 받으면 자료를 JSON으로 바꿔주는 함수
async function getInfo(html) {
    try {
    
        // string HTML -> DOM obj
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

    } catch (err) {
        console.error(err);
    }
}

// getInfo(html);
