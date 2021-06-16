const puppeteer = require('puppeteer');
const fs = require('fs');

const baseUrl = 'https://j-island.net/artist/group/id/';

const pageUrls = [{
        group_name: 'Shonen_Ninja',
        url: '14'
    },
    {
        group_name: 'Travis_Japan',
        url: '5'
    },
    {
        group_name: 'Impactors',
        url: '16'
    },
    {
        group_name: 'Hi_Hi_Jets',
        url: '6'
    },
    {
        group_name: 'Bi_Shonen',
        url: '7'
    },
    {
        group_name: '7_Men_Samurai',
        url: '8'
    },
    {
        group_name: 'Jr_Special',
        url: '15'
    },
    {
        group_name: 'Naniwa_Danshi',
        url: '11'
    },
    {
        group_name: 'Lil_Kansai',
        url: '12'
    },
    {
        group_name: 'A_Group',
        url: '13'
    }
]

const converToCSV = (objArray) => {
    const arrayData = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    for (let i = 0; i < arrayData.length; i++){
        let line = '';
        for (let index in arrayData[i]) {
            if (line != '') line += ','

            line += arrayData[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}

const main = async () => {
    let group = 0;
    if (process.argv.length === 3) {
        try {
            group = parseInt(process.argv[2]);
        } catch(e) {
            console.error(`Failed to parse ${process.argv[2]}`);
            process.exit(1);
        }
    }

    const pageUrl = `${baseUrl + pageUrls[group].url}`;
    const currentGroup = pageUrls[group].group_name;
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(pageUrl);
    await page.waitForTimeout(3000);
    const fullHtml = await page.content();
    const movieLinks = [];
    const loadMoreButtonSelector = '.load-more__btn';
    let loadMoreButton;
    
    // for (let i = 0; i < 8; i++) {
    while(true){
        try {
            loadMoreButton = await page.$(loadMoreButtonSelector);
            await loadMoreButton.click();
            await page.waitForTimeout(1000);
        } catch (e) {
            break;
        }
    }
    const movieLinkElements = await page.$$eval('.l-thumb-list__list > a', (els) => els.map((el) => {
        const linkUrl = el.href;
        const movieTitle = el.querySelector('.l-thumb-list__title').innerHTML;
        const movieDate = el.querySelector('.l-thumb-list__date').innerHTML;
        return {movieDate, movieTitle, linkUrl};
    }));
    const convertedCSV = converToCSV(JSON.stringify(movieLinkElements));
    // console.log(convertedCSV);
    // console.log(movieLinkElements);
    fs.writeFile(currentGroup + '_' + Date.now().toString() + '.csv', convertedCSV, function(error) {
        if (error) throw error;
        console.log('CSV saved')
    })
    // fs.writeFile('islandtv.html', fullHtml, function(err) {
    //     if (err) throw err;
    //     console.log('saved')
    // })
    // console.log(fullHtml);
    await page.waitForTimeout(3000);
    await browser.close();
}

main();
