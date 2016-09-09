var packet = require("./packet.js");

var characterType = {WARRIOR:0x00, MAGE:0x00, HK:0x00, ARCHER:0x00, EMPTY:0xFF};
var characterTown = {TEMOZ:0x00, QUANANTO: 0x01};
module.exports = {
  prepareCharacterPacket: function(rows){
    var charPacket = [0xB8, 0x03, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x03, 0xFF, 0x05, 0x11];
    for(var i=0; i<5; i++) {
      charPacket = charPacket.concat(this.getCharacter(rows, i));
    }
    return charPacket;
  },
  getCharacter: function(rows, index) {
    try {
      var characterNameLength = 20;
      var charPacket = [];
      if(rows[index] == undefined) {
        var charName = "";
        var charType = characterType.EMPTY;
        var charTown = characterTown.TEMOZ;
        var charLevel = 0;
        for(var i=0;i<characterNameLength;i++) {
          charPacket.push(0x00);
        }
        charPacket.push(0x00);
        charPacket.push(0x01);
        charPacket.push(charType);
        charPacket.push(charTown);
        charPacket = charPacket.concat(packet.helper.toBytesInt32(charLevel));
        var packetLength = charPacket.length ;
        for(var i=0;i<188-packetLength;i++) {
          charPacket.push(0x00);
        }
        return charPacket;
        //blank character
      } else {
        //Prepare character from DB
      }
    } catch(e) {
      console.log("ex : ",e);
    }
  }
};
