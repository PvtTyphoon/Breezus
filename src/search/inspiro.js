const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const rp = require("request-promise");

module.exports = class lookupCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "inspiro",
			aliases: ["i", "inspiro"],
			group: "search",
			memberName: "inspiro",
			description: stripIndents`
			Generates a quote image from the inspirobot API.
			> Example Usage: .inspiro
			`,
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
