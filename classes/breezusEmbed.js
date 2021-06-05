const { MessageEmbed } = require("discord.js");
const { colourGen } = require("../util/Util");

module.exports = class BreezusEmbed extends MessageEmbed {
  constructor(message) {
    super(message);
    this.setColor(colourGen());
    this.setAuthor(
      `Executed by ${message.author.username}`,
      "https://i-really-should.go-get-a.life/BbAuZQ.gif"
    );
  }
};
