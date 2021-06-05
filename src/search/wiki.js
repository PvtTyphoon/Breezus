const BreezusCommand = require("../../classes/command");
const { stripIndents } = require("common-tags");
const wiki = require("wikijs").default;

module.exports = class lookupCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "wiki",
			group: "search",
			memberName: "wiki",
			description: stripIndents`
			Wikipedia lookup.
			> Example Usage: .wiki [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		let query = args.slice(0).join(" ");
		if (!query) return message.reply("Please provide a search query.");
		const res = await wiki().search(query);
		const data = await wiki().page(res.results[0]);
		message.channel.send(`🔗 | ${data.fullurl}`);
	}
};
