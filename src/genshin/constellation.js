const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const genshin = require("genshin-db");
const { paginationEmbed, genshinChunkData } = require("../../util/pagination");

module.exports = class genshinCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "constellation",
			aliases: ["constellations"],
			group: "genshin",
			memberName: "constellation",
			description: stripIndents`
			Constellation lookup for Genshin Impact.
			> Example Usage: .constellation [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) {
			var data = await genshin.constellations("names", {
				matchCategories: true,
			});
			paginationEmbed(
				message,
				genshinChunkData(message, data, "constellation"),
			);
			return;
		}
		const query = args.join(" ");
		var data = await genshin.constellations(query);
		if (!data)
			return message.reply(`Search for \`${query}\` returned no result.`);

		var constellations = [data.c1, data.c2, data.c3, data.c4, data.c5, data.c6];
		var constellationImages = [
			data.images.c1,
			data.images.c2,
			data.images.c3,
			data.images.c4,
			data.images.c5,
			data.images.c6,
		];
		var pages = [];
		for (let i = 0; i < 6; i++) {
			var embed = new BreezusEmbed(message)
				.setTitle(data.name)
				.setDescription(
					stripIndents`
		Constellation C${1 + i}:
		
		**\`${constellations[i].name}\`**
		${constellations[i].effect}
		`,
				)
				.setThumbnail(constellationImages[i]);
			pages.push(embed);
		}
		paginationEmbed(message, pages);
	}
};
