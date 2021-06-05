const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const genshin = require("genshin-db");
const { paginationEmbed, genshinChunkData } = require("../../util/pagination");

module.exports = class genshinCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "food",
			aliases: ["foods"],
			group: "genshin",
			memberName: "food",
			description: stripIndents`
			Food lookup for Genshin Impact.
			Adding the -c flag to your query will search for categories.
			> Example Usage: .food [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) {
			var data = await genshin.foods("names", { matchCategories: true });
			paginationEmbed(
				message,
				genshinChunkData(message, data, "recipe", "food", 10),
			);
			return;
		}
		if (args.includes("-c")) {
			const query = args.filter((flag) => flag !== "-c").join(" ");
			var data = await genshin.foods(query, { matchCategories: true });
			if (!data)
				return message.reply(`Search for \`${query}\` returned no result.`);
			paginationEmbed(
				message,
				genshinChunkData(message, data, `\`${query}\` star food`, "food"),
			);
			return;
		}
		const query = args.join(" ");
		var data = await genshin.foods(query, { matchAliases: true });
		if (!data)
			return message.reply(`Search for \`${query}\` returned no result.`);
		var embed = new BreezusEmbed(message)
			.setThumbnail(
				`https://genshin-impact.fandom.com/wiki/Special:Redirect/file/Item_${data.name
					.split(/ +/g)
					.join("_")}.png`,
			)
			.setTitle(data.name, data.url.fandom).setDescription(stripIndents`
		${data.description}
		**__Information:__**
		**Effect:** ${data.effect}
		> **Type:** ${data.foodtype}
		> **Filter | Category:** ${data.foodfilter} | ${data.foodcategory}
		> **Star Rating:** ${
			data.rarity
		} Stars <a:genshinStarRating:847385006775205888> 
		> ${"<a:genshinStar:847384776385757206>".repeat(data.rarity)}
		**__Ingredients:__**
		>>> ${data.ingredients
			.map((ingredient) => `${ingredient.count}x ${ingredient.name}`)
			.join("\n")}
		`);
		if (data.suspicious)
			embed.addField(
				"Suspicious",
				stripIndents`
		**Description:** ${data.suspicious.description}
		**Effect:** ${data.suspicious.effect}
		`,
				false,
			);
		if (data.normal)
			embed.addField(
				"Normal",
				stripIndents`
		**Description:** ${data.normal.description}
		**Effect:** ${data.normal.effect}
		`,
				false,
			);
		if (data.delicious)
			embed.addField(
				"Delicious",
				stripIndents`
		**Description:** ${data.delicious.description}
		**Effect:** ${data.delicious.effect}
		`,
				false,
			);
		message.channel.send({ embed });
	}
};
