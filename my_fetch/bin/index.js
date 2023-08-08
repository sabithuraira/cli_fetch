#! /usr/bin/env node
const fs = require('fs');
const axios = require('axios')


if (process.argv.length === 2) {
    console.error('Expected at least one argument!');
    process.exit(1);
}
else{	
    if(process.argv.length==4 && process.argv[2]=='--metadata'){
        if(isValidUrl(process.argv[3])){
            let fileName = process.argv[3].replace("https://", "").replace("http://", "");
            try {
                if (fs.existsSync(fileName + ".metadata")) getMetadata(fileName + ".metadata")
                else fetchPage(process.argv[3], true);
            } catch(err) {
                console.error(err)
            }
        }
        else{
            console.error(process.argv[3] + " is invalid url")
        }
    }
    else{
        var i=2, len=process.argv.length;
        while (i<len) {
            if(isValidUrl(process.argv[i])){
                fetchPage(process.argv[i]);
            }
            else{
                console.log(`${process.argv[i]} is not a valid url`);
            }
            i++;
        }
    }
}

function isValidUrl(str) {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$', // fragment locator
        'i'
      );
      return pattern.test(str);
}

function fetchPage(strUrl, isPrintMetadata=false){
    axios.get(`${strUrl}`)
    .then(res => {
        // let fileName = res.config.url.replace("https://", "").replace("http://", "");
        let fileName = strUrl.replace("https://", "").replace("http://", "");
        
        fs.writeFile(`${fileName}.html`, res.data, function (err) {
            if (err) throw err;
            console.log('File is created successfully.');
        });

        var date = new Date();
        let metadataStr = `site: ${fileName} \n`;
        metadataStr += "num_links: ";
        if(res.data.match(/<a /gi)==null)
            metadataStr += "0 \n";
        else
            metadataStr += (res.data.match(/<a /gi).length) + "\n";

        let totalImage = 0;
        if(res.data.match(/<img /gi)!=null) totalImage += res.data.match(/<img /gi).length;
        if(res.data.match(/<image /gi)!=null) totalImage += res.data.match(/<image /gi).length;

        metadataStr += "images: " + totalImage + " \n";
        metadataStr += `last_fetch: ${date}`;

        fs.writeFile(`${fileName}.metadata`, metadataStr, function (err) {
            if (err) throw err;
            console.log('Metadata is created successfully.');
            if(isPrintMetadata){
                getMetadata(fileName + ".metadata");
            }
        });
    })
    .catch(function (error) {
        console.log(JSON.stringify(error.message))
        console.log("maybe your url is not valid or check your internet")
      });
}

function getMetadata(strUrl){
    fs.readFile(strUrl, function(err, data) {
        console.log(data.toString());
    });
}