const { MessageEmbed } = require("discord.js");
const { colourGen } = require("../util/Util");
const { stripIndents } = require("common-tags");

module.exports = class ErrorEmbed extends MessageEmbed {
	constructor(message) {
		super(message);
		this.setColor(colourGen());
		this.setDescription(stripIndents`
		An error occured while running a command, 
		Command run by ${message.author.tag}
		Error info:
		>>> Command: **${message.content}**
		[Link](${message.url}) in #${message.channel.name}, in ${message.guild.name}.
		`);
	}
};
