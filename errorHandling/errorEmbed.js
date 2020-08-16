const { RichEmbed } = require("discord.js");
const { colourGen } = require("../util/Util");
const { stripIndents } = require("common-tags");

module.exports = class ErrorEmbed extends RichEmbed {
	constructor(message) {
		super(message);
		this.setColor(colourGen());
		this.addField("Command Author", message.author.tag, false);
		this.addField("Command", message.content, false);
		this.addField(
			"Message",
			stripIndents`
		Link: 
		> [Link.](${message.message.url})
		Channel: 
		> ${message.channel.name}
		\`${message.channel.id}\`
		Server: 
		> ${message.guild.name}
		\`${message.guild.id}\`
		`,
			false,
		);
	}
};
