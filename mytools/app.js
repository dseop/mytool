var createError = require('http-errors');
var express = require('express');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')
const chromedriver = require('chromedriver');
const { JSDOM } = require("jsdom");
// '{}' 구조 분해 할당(destructuring assignment) 구문
// jsdom 객체에서 JSDOM 속성을 추출하여 JSDOM 변수에 할당
// 이게 없으면 jsdom.JSDOM 객체를 사용하면 됨.

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 라우터를 쓸 때는 이런 식으로 쓰는 모양 //
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

app.use(cookieParser());
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 라우터를 받는 케이스 //
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

let options = new chrome.Options();
// options.addArguments('headless'); // Chrome을 headless 모드로 실행

// Chrome 드라이버 생성
const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();

// GET /api/scrape 요청에 대한 처리
app.get('/api/scrape', async (req, res) => {
  try {
    let url = 'https://new.land.naver.com/houses?ms=37.5538871,126.9071715,17&a=VL:DDDGG:JWJT:SGJT:HOJT&b=B1:A1&e=RETAIL&g=30000&j=10&q=TWOROOM';
    await driver.get(url);
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css('div.loader')), 5*1000);
    // driver.wait(): 조건을 기다리며 대기. 대기한 시간과 충족한 결과를 반환.
    // webdriver.until.elementLocated(): 인수로 전달된 Locator로 DOM 요소가 생성될 때를 기다림
    // webdriver.By.css(): DOM 요소를 찾는 Locator 객체
    
    const loader = await driver.findElement(webdriver.By.css('div.loader'));
    // driver.findElement(): 인수로 전달된 Locator로 DOM 요소를 검색, WebElement 객체(첫 번째 DOM 요소)를 반환

    // 첫 번째 부동산 정보를 클릭해서 불러와보자
    const elements = await driver.findElements(webdriver.By.className('item_link'));

    for (let i = 0; i < 2; i++ ) { //elements.length; i++) {
      // 클릭해서 펼치기
      await elements[i].click();
    
      // 정보 얻어오기
      const detailContentsInner = await driver.findElement(webdriver.By.className('detail_contents_inner'));
      const mainInfoAreaText = await driver.executeScript("return arguments[0].querySelector('.main_info_area').textContent", detailContentsInner);
      const detailBoxSummaryText = await driver.executeScript("return arguments[0].querySelector('.detail_box--summary').textContent", detailContentsInner);
      // const detailBoxDuesText = await driver.executeScript("return arguments[0].querySelector('.detail_box--dues').textContent", detailContentsInner); // 중개 보수 필요 없음
      const detailBoxLedgerText = await driver.executeScript("return arguments[0].querySelector('.detail_box--ledger').textContent", detailContentsInner);      
      
      console.log("mainInfo: \n"+mainInfoAreaText, "\n detailBoxSummary: \n"+detailBoxSummaryText, "\n detailBox: \n"+detailBoxLedgerText);

      const waitTime = Math.floor(Math.random() * 2) + 0.5; // 0.5~1.5 사이의 랜덤한 정수 생성
      await driver.sleep(waitTime * 1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)    

      // await driver.navigate().back(); // 뒤로 가기
    }
    

    try {
      await driver.wait(webdriver.until.elementIsVisible(loader), 2000);
      // loader가 로드될 때까지 대기
    } catch (err) {
      if (err.name === 'TimeoutError') {
        console.error('TimeoutError occurred while waiting for element to be visible:', err);
      } else {
        console.error('Error occurred while waiting for element to be visible:', err);
      }
    }
    
    for (let i = 0; i < 1; i++) { // 10번 반복
      try {
        await driver.executeScript('arguments[0].scrollIntoView();', loader);
        // scrollIntoView() 메서드: 해당 요소가 현재 뷰포트에서 보이도록 스크롤
      } catch (err) {
        
      }
      const waitTime = Math.floor(Math.random() * 2) + 0.5; // 0.5~1.5 사이의 랜덤한 정수 생성
      await driver.sleep(waitTime * 1000); // 랜덤한 대기 시간 적용 (밀리초 단위로 변환)    
    }

    
    const pageSource = await driver.getPageSource(); // 문자열 HTML을 가져옴    
    const dom = new JSDOM(pageSource); // jsdom으로 HTML 파싱
    // JSDOM 클래스: DOM(Document Object Model) 구조를 제공하는 노드 패키지
    // 문자열 형식의 HTML을 전달 받으면 생성자 함수가 이를 DOM 노드의 트리로 변환
    // DOM은 HTML, XML, SVG 등의 문서를 계층적인 트리 구조로 나타내는 모델
    // HTML 문서 -> 트리의 루트는 HTML 태그, 자식 노드에 head, body.
    // Selenium은 DOM 트리를 기반으로 작동
    
    const document = dom.window.document; // document 객체 가져오기
    // dom -> DOM 트리 객체
    // dom.window -> DOM 객체의 전역 객체: js code 전역 범위에서 접근 가능한 객체. 브라우저 환경에서의 window 객체와 유사. 브라우저에서 사용가능한 대부분의 기능들을 제공.
    // dom.window.document -> DOM 객체의 문서를 나타내는 객체. 이걸로 DOM 노드에 접근.
    // HTML 문서의 루트 요소인 <html> 요소를 포함한 모든 DOM 노드에 대한 접근을 제공

    const panelGroup = document.querySelector('#listContents1');
    // selector -> CSS Selector를 이용해 특정 요소를 선택하는 방법
    // '.class-name' -> 클래스 이름으로 찾기
    // '#id-name' -> 아이디로 찾기
    // 'tag-name' -> 태그 이름으로 찾기
    // '[attribute-name=attribute-value]' -> 속성으로 찾기
      // '[class=class-name]' => '.class-name'과 같음
    
    // 전부 다 불러오기 끝.

    // let resultHtml = panelGroup.textContent; // div 요소의 텍스트 내용 출력
    let resultHtml = panelGroup.outerHTML; // div 요소의 HTML 출력
    // panelGroup도 DOM 객체. textContent -> 텍스트 내용을 가져오거나 설정할 수 있는 특별한 속성

    // 결과를 응답으로 전송
    res.send(resultHtml);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// 서버 시작
// app.listen(3000, () => console.log('Server started on port 3000'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: 'Something went wrong.',
    error: err
  });
});

module.exports = app;
