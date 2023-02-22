// HTML JSON function
const { JSDOM } = require('jsdom');
const fs = require('fs');

function isElementFound(element) {
    if (element !== null) {
        return element
    } else { return 'there is no Element' }
}


// load file
const html = fs.readFileSync('test.html', 'utf-8');
// .readFileSync(): 동기적으로 파일을 읽어오는 메서드

// const html = await fs.readFile('page.html', 'utf-8');
// .readFile(): 비동기적으로 파일을 읽어옴. 비동기함수 안에서 이 작업을 동기적으로 돌아가게 하기 위해 await가 붙음


async function test(html) {
    try {
        const maxSn = 150;

        const dom = new JSDOM(html);
        const document = dom.window.document;

        // check total number of saling house
        let saleNumbers = document.querySelectorAll('.sale_number');
        let sumSn = 0;
        saleNumbers.forEach( sns => {
            let sn = parseInt(sns.childNodes[0].textContent, 10)
            sumSn += sn;
            console.log(`+${sn} = ${sumSn}`);
        });
        console.log(`*total search result: ${sumSn}`)

        // scroll

        //
        console.log(result)     

    } catch (err) {
        console.error(err);
    }
}

test(html);



// HTML -> JSON
async function htmlToJson(html) {
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

        // await driver.quit(); // 브라우저 종료
        console.log("ok")

    } catch (err) {
        console.error(err);
    }
}

// htmlToJson(html);
