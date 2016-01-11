"use strict";

var fs = require("fs");
var path = require("path");

var cacheDir = ".wantu-cache";
var cachePath = path.join(__dirname, cacheDir);

var Wantu = require("wantu");

module.exports = function( options, modified, total, next ) {
  if ( !(options.accessKey && options.secretKey) ) {
    fis.log.error("ACCESS_KEY and SECRET_KEY are required!");
  }
  else if ( !options.namespace ) {
    fis.log.error("Namespace is required!");
  }

  if ( !fs.existsSync(cachePath) ) {
    fs.mkdirSync(cachePath);
  }

  var wantu = new Wantu(options.accessKey, options.secretKey);

  modified.forEach(function( file ) {
    var releasePath = file.getHashRelease();
    var releaseFileName = path.basename(releasePath);
    var cacheFilePath = path.join(cachePath, releaseFileName);

    if ( !fs.existsSync(cacheFilePath) ) {
      fs.writeFileSync(cacheFilePath, file.getContent());
    }

    wantu.singleUpload({
      namespace: options.namespace,
      expiration: -1
    }, cacheFilePath, releasePath.replace("/" + releaseFileName, ""), "", "", function( err, res ) {
      if ( !err ) {
        if ( res.statusCode === 200 ) {
          var time = "[" + fis.log.now(true) + "]";

          process.stdout.write(
              "\nWantu uploader - ".green.bold +
              time.grey + " " +
              file.subpath.replace(/^\//, "") +
              " >> ".yellow.bold +
              JSON.parse(res.data).url
          );

          fs.unlinkSync(cacheFilePath);
          
          next();
        }
        else {
          console.log(res);
          fis.log.error("Something is wrong when uploading to Wantu!");
        }
      }
      else {
        fis.log.error(err);
      }
    });
  });
};
