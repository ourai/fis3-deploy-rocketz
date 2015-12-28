"use strict";

var rocketz = require("rocketz");

module.exports = function( options, modified, total, next ) {
  if ( !options ) {
    fis.log.error("Invalid RocketZ's setting!");
  }

  rocketz.init(options);

  if ( rocketz.preview() ) {
    rocketz.run();
  }

  next();
};
