var packet = require("./packet.js");

var characterType = {WARRIOR:0x00, MAGE:0x02, HK:0x00, ARCHER:0x00, EMPTY:0xFF};
var characterTown = {TEMOZ:0x00, QUANANTO: 0x01};
module.exports={
  prepareCharacterPacket: function(rows){
    var charPacket = [0xB8, 0x03, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x03, 0xFF, 0x05, 0x11]
    for(var i=0; i<5; i++)
    {
      charPacket = charPacket.concat(this.getCharacter(rows, i));
    }
    return charPacket;
  },
  getCharacter: function(rows, index)
  {
    try
    {
      var charPacket = [];
      if(rows[index] == undefined) // blank character
      {
        var characterNameLength = 20;
        var charName = "";
        var charType = characterType.EMPTY;
        var charTown = characterTown.TEMOZ;
        var charLevel = 0;
        for(var i=0;i<characterNameLength;i++)
        {
          charPacket.push(0x00);
        }
        charPacket.push(0x00);
        charPacket.push(0x01);
        charPacket.push(charType);
        charPacket.push(charTown);
        charPacket = charPacket.concat(packet.helper.toBytesInt32(charLevel));
        var packetLength = charPacket.length ;
        for(var i=0;i<188-packetLength;i++)
        {
          charPacket.push(0x00);
        }
        return charPacket;
      }
      else
      {
        var charName = rows[index].name;
        var charType = characterType.WARRIOR;
        var charTown = characterTown.TEMOZ;
        var charLevel = 0;
        var charNameBytes = packet.helper.getBytesFromString(charName)
        charPacket = charPacket.concat(charNameBytes);
        charPacket = charPacket.concat(packet.helper.getNullBytes(20 - charNameBytes.length));
        charPacket.push(0x00);
        charPacket.push(0x01);
        charPacket.push(charType);
        charPacket.push(charTown);
        charPacket = charPacket.concat(packet.helper.toBytesInt32(charLevel));
        var packetLength = charPacket.length ;
        for(var i=0;i<188-packetLength;i++)
        {
          charPacket.push(0x00);
        }
        return charPacket;
        //Prepare character from DB record
      }
    }
    catch(e)
    {
      console.log("ex : ",e);
    }
  },
  createCharacter:function(packet, accountId)
  {
    var charType = packet[12];
    var charTown = packet[13];
    var charName = packet.helper.getStringFromBytes(packet,14,33);

  },
  deleteCharacter:function(packet)
  {

  }
}
