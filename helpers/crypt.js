'use strict';

module.exports = {
  config: null,

  prepare: function (config) {
    this.config = config;
  },
  encrypt: function (packet) {
    for (var i = 12; ((i + 4) | 0) <= packet.length; i = (i + 4) | 0) {
      var DynamicKey = this.config.cryptography.dynamic_key;
      for (var j = i; j < ((i + 4) | 0); j = (j + 1) | 0) {
        packet[j] = ((packet[j] ^ (DynamicKey >> 8))) & 255;
        DynamicKey = ((((((packet[j] + DynamicKey) | 0)) * this.config.cryptography.constant_key_1) | 0) + this.config.cryptography.constant_key_2) | 0;
      }
    }
    return packet;
  },
  decrypt: function (packet) {
    //[0]-[11]: Packet Header
    for (var i = 12; ((i + 4) | 0) <= packet.length; i = (i + 4) | 0) {
      var DynamicKey = this.config.cryptography.dynamic_key;
      for (var j = i; j < ((i + 4) | 0); j = (j + 1) | 0) {
        var pSrc = packet[j];
        packet[j] = ((packet[j] ^ (DynamicKey >> 8))) & 255;
        DynamicKey = ((((((pSrc + DynamicKey) | 0)) * this.config.cryptography.constant_key_1) | 0) + this.config.cryptography.constant_key_2) | 0;
      }
    }
    return packet;
  }
};
