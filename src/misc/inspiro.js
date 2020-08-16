const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");

module.exports = class inspiroCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "inspiro",
			aliases: ["i", "inspiro"],
			group: "misc",
			memberName: "inspiro",
			description: 
				"Generates an inspiro bot quote.",
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var link = await this.fetchData();
		const embed = new BreezusEmbed(message).setImage(link);
		message.channel.send({ embed });
	}
	async fetchData() {
		var options = {
			uri: "https://inspirobot.me/api",
			json: true,
			qs: {
				generate: "true",
			},
		};
		const link = await rp(options);
		return link;
	}
};
