const fs = require("fs")
const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

const findingsMarker = "Critical vulnerabilities are usually straightforward to  exploit" //  marker to skip to the findings part, to skip as many false positives as possible. Marker is short to work also with earlier audit structures (2yo)
let files = fs.readdirSync("audits");


search(process.argv[2])

async function search(key){
  let c = 0
  for(let file of files){
    if(await includesPDF(file, key))
      console.log("Match found - " + file)
    if(c%10 == 0) console.log(c + " audits inspected")
    c++
  }
}

async function includesPDF(file, keyword){
  return new Promise((resolve, reject) => {
    pdfExtract.extract('audits/' + file, {}, (err, data) => {
      if (err){
        console.log(err);
        process.exit()
      }
      let fullText = data.pages.reduce((prev, curr) => 
        prev + ' ' + curr.content.reduce((_prev, _curr) => _prev + _curr.str + ' ', '')
        , '') // pdf contents to single string
      let pos = fullText.indexOf(findingsMarker) // skip to findings section
      if(pos != -1) 
        fullText = fullText.substring(pos)
      if(fullText.toLowerCase().includes(keyword.toLowerCase())) // search is case insensitive
        resolve(true)
      resolve(false)
        
    });
  })
}

