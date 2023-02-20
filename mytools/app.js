var createError = require('http-errors');
var express = require('express');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')
const chromedriver = require('chromedriver');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 라우터를 쓸 때는 이런 식으로 쓰는 모양
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cookieParser());
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 라우터를 받는 케이스
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Chrome을 headless 모드로 실행
let options = new chrome.Options();
// options.addArguments('headless');

// Chrome 드라이버 생성
const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();

// GET /api/scrape 요청에 대한 처리
app.get('/api/scrape', async (req, res) => {
  try {
    // 페이지 로딩 대기
    let url = 'https://new.land.naver.com/houses?ms=37.5538871,126.9071715,17&a=VL:DDDGG:JWJT:SGJT:HOJT&b=B1:A1&e=RETAIL&g=30000&j=10&q=TWOROOM';
    await driver.get(url);
    // drive.wait(): 호출해서 대기하는 조건 지정
    await driver.wait(webdriver.until.elementLocated(webdriver.By.css('div.loader')), 5*1000);
    // elementLocated() 메서드는 해당 요소가 발견되었을 때 Promise를 반환
    // 대부분 비동기 함수는 'Promise' 객체를 반환
    // await 키워드 -> promise 해결될 때 까지 대기

    const loader = await driver.findElement(webdriver.By.css('div.loader'));
  
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
    
    for (let i = 0; i < 10; i++) { // 10번 반복
      try {
        await driver.executeScript('arguments[0].scrollIntoView();', loader);
        // scrollIntoView() 메서드: 해당 요소가 현재 뷰포트에서 보이도록 스크롤
      } catch (err) {
        
      }
      await driver.sleep(1000); // 1초간 대기
    }

    // HTML을 가져옴
    const pageSource = await driver.getPageSource();
    console.log(pageSource)

    // 결과를 응답으로 전송
    res.send(pageSource);
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
