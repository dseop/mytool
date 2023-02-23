// load json file

async function test() {
    const fs = require('fs');

    fs.readFile('data.json', (err, data) => {
    if (err) throw err;
    const jsonData = JSON.parse(data);
    // console.log(jsonData);
    });

    
}

test();