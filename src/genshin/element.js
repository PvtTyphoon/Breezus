const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const genshin = require("genshin-db");
const { paginationEmbed, genshinChunkData } = require("../../util/pagination");

module.exports = class genshinCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "element",
			aliases: ["elements"],
			group: "genshin",
			memberName: "element",
			description: stripIndents`
			Element lookup for Genshin Impact.
			Adding the -c flag to your query will search for categories.
			> Example Usage: .element [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) {
			var data = await genshin.elements("names", { matchCategories: true });
			paginationEmbed(message, genshinChunkData(message, data, "element"));
			return;
		}
		const query = args.join(" ");
		var data = await genshin.elements(query);
		if (!data)
			return message.reply(`Search for \`${query}\` returned no result.`);

		var embed = new BreezusEmbed(message)
			.setTitle(data.name)
			.setColor(data.color)
			.setDescription(
				stripIndents`
		**${data.name}** a **${data.type}** element of the **${data.region}** region with **${data.archon}** as it's archon. This element thematically represents **${data.theme}**.
		`,
			)
			.setThumbnail(data.url);
		message.channel.send({ embed });
	}
};
