const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const genshin = require("genshin-db");
const table = require("text-table");
const { paginationEmbed, genshinChunkData } = require("../../util/pagination");

module.exports = class genshinCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "character",
			group: "genshin",
			memberName: "character",
			description: stripIndents`
			Character lookup for Genshin Impact.
			Adding the -c flag to your query will search for categories.
			> Example Usage: .character [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) {
			var data = await genshin.characters("names", { matchCategories: true });
			paginationEmbed(message, genshinChunkData(message, data, "character"));
			return;
		}
		if (args.includes("-c")) {
			const query = args.filter((flag) => flag !== "-c").join(" ");
			var data = await genshin.characters(query, { matchCategories: true });
			if (!data)
				return message.reply(`Search for \`${query}\` returned no result.`);
			paginationEmbed(
				message,
				genshinChunkData(
					message,
					data,
					`\`${query}\` (star) character`,
					"character",
				),
			);
			return;
		}
		const query = args.join(" ");
		var data = await genshin.characters(query);
		if (!data)
			return message.reply(`Search for \`${query}\` returned no result.`);

		var pages = [];

		var embed = new BreezusEmbed(message)
			.setTitle(`${data.name} - ${data.title}`, data.url.fandom)
			.setDescription(
				stripIndents`
		${data.description}
		
		> **Element:** ${data.element}
		> **Weapon Type:** ${data.weapontype}
		> **Substat:** ${data.substat}
		> **Region:** ${data.region}
		> **Birthday:** ${data.birthday}
		> **Constellation:** ${data.constellation}
		> **Talent Material Type:** ${data.talentmaterialtype}
		> **Star Rating:** ${
			data.rarity
		} Stars <a:genshinStarRating:847385006775205888> 
		> ${"<a:genshinStar:847384776385757206>".repeat(data.rarity)}
		`,
			)
			.setThumbnail(data.images.image)
			.setImage(data.images.cover1);
		pages.push(embed);
		// not using a for lop because im lazy
		var statsArr = [
			["+ Level", "|", "HP", "|", "ATK", "|", "DEF"],
			[
				"- Lvl 1",
				"|",
				Math.round(data.stats(1).hp),
				"|",
				Math.round(data.stats(1).attack),
				"|",
				Math.round(data.stats(1).defense),
			],
		];
		for (let i = 1; i < 10; i++) {
			statsArr.push([
				`- Lvl ${10 * i}`,
				"|",
				Math.round(data.stats(10 * i).hp),
				"|",
				Math.round(data.stats(10 * i).attack),
				"|",
				Math.round(data.stats(10 * i).defense),
			]);
		}
		var statsTable = table(statsArr, {
			align: ["l", "r", "r", "r", "r", "r", "r"],
		});

		var embed = new BreezusEmbed(message)
			.setTitle(`${data.name} - ${data.title}`, data.url.fandom)
			.setThumbnail(data.images.portrait).setDescription(stripIndents`
		Base stats for ${data.name} without bonuses.
		>>> \`\`\`diff
		${statsTable}
		\`\`\`
		`);
		pages.push(embed);
		paginationEmbed(message, pages);
	}
};
