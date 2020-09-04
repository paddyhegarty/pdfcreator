const puppeteer = require('puppeteer')
const Handlebars = require('handlebars')
const express = require('express')
const fs = require('fs-extra')
const path = require('path')
const app = express()
const port = 3000
const data = require('./invoice.json')

const compile = async function (templateID, data) {
    const filePath = path.join(process.cwd(), 'templates', `${templateID}`, 'list.hbs')
    const html = await fs.readFile(filePath, 'utf-8')
    return Handlebars.compile(html)(data)
}

let codeBlock = '<div style="text-align: right;width: 297mm;font-size: 8px;"><span style="margin-right: 1cm"><span class="pageNumber"></span> of <span class="totalPages"></span></span></div>'
let docId = '717171'
let userid = '88888'
let templateID = 'template1'
//let templateID = 'template2'

//create folder if it doesnt exist

var dir = `./pdfs/${userid}`;

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

let pdfPath = `./pdfs/${userid}/${docId}.pdf`

const makePdf = async () => {

    try {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const content = await compile(templateID, data)

        await page.setContent(content);
        await page.emulateMedia('screen');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: "<div style=\"text-align: right;width: 297mm;font-size: 8px;\"><span style=\"margin-right: 1cm\"><span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></span></div>",
            footerTemplate: codeBlock
        });

        console.log('done');
        await browser.close()

    } catch (error) {

        console.log(error)

    }

}

app.get('/', (req, res) => {
    makePdf()
    res.send('working')
})

app.listen(port, () => {
    console.log(`Application running on port ${port}`)
})