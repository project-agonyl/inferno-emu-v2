/**
 * item.js - Item helper module
 */

'use strict';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');
var logger = require('./logger.js');
var packet = require('./packet.js');
var _ = require('lodash');
var fs = require('fs');
var maxItemColumn1 = 16384;
var items = {};
var it0File = __dirname + '/../data/item/IT0.bin';
var it0Data = [];

if (fs.existsSync(it0File)) {
  fs.readFile(it0File, (err, fdata) => {
    if (err) {
      logger.error(err);
    } else {
      it0Data = toArrayBuffer(fdata);
      var oneSeriesCode = 1024;
      var twoSeriesCode = 2066;
      var threeSeriesCode = 3272;
      for (var i = 0; i < it0Data.length; i = i + 242) {
        var series = packet.helper.getIntFromReverseHex([it0Data[i], it0Data[i + 1]]);
        if (series < 1 || series > 3) {
          continue;
        }
        var currentItemCode = oneSeriesCode;
        switch (series) {
          case 3:
            currentItemCode = threeSeriesCode;
            threeSeriesCode++;
            break;
          case 2:
            currentItemCode = twoSeriesCode;
            twoSeriesCode++;
            break;
          case 1:
            currentItemCode = oneSeriesCode;
            oneSeriesCode++;
            break;
        }
        if (!items.hasOwnProperty(currentItemCode)) {
          items[currentItemCode] = {};
        }
        items[currentItemCode].name = '';
        for (var j = i + 8; j < i + 30; j++) {
          if (it0Data[j] === 0) {
            break;
          }
          items[currentItemCode].name += String.fromCharCode(it0Data[j]);
        }
        items[currentItemCode].type = packet.helper.getIntFromReverseHex([it0Data[i + 4], it0Data[i + 5]]);
        items[currentItemCode].attribute = packet.helper.getIntFromReverseHex([it0Data[i + 70], it0Data[i + 71]]);
        items[currentItemCode].maxAttribute = packet.helper.getIntFromReverseHex([it0Data[i + 72], it0Data[i + 73]]);
      }
      logger.info('Loaded ' + _.size(items) + ' items');
    }
  });
} else {
  logger.error('Could not find the file: ' + it0File);
}

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return view;
}

function getSmallItemCode(itemCode) {
  if (isNaN(parseInt(itemCode))) {
    return itemCode;
  }
  itemCode = parseInt(itemCode);
  while (itemCode > (maxItemColumn1 * 4)) {
    itemCode -= (maxItemColumn1 * 4);
  }
  while (itemCode > (maxItemColumn1 * 2)) {
    itemCode -= (maxItemColumn1 * 2);
  }
  while (itemCode > maxItemColumn1) {
    itemCode -= maxItemColumn1;
  }
  return itemCode;
}

module.exports = {
  getItem: function (itemCode) {
    return items[getSmallItemCode(itemCode)];
  },
  getAllItems: function () {
    return items;
  }
};
