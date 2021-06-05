const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const genshin = require("genshin-db");
const { paginationEmbed, genshinChunkData } = require("../../util/pagination");
const table = require("text-table");

module.exports = class genshinCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "weapon",
			aliases: ["weapons"],
			group: "genshin",
			memberName: "weapon",
			description: stripIndents`
			Weapon lookup for Genshin Impact.
			Adding the -c flag to your query will search for categories.
			> Example Usage: .weapon [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) {
			var data = await genshin.weapons("names", { matchCategories: true });
			paginationEmbed(message, genshinChunkData(message, data, "weapon"));
			return;
		}
		if (args.includes("-c")) {
			const query = args.filter((flag) => flag !== "-c").join(" ");
			var data = await genshin.weapons(query, { matchCategories: true });
			if (!data)
				return message.reply(`Search for \`${query}\` returned no result.`);
			paginationEmbed(
				message,
				genshinChunkData(message, data, `\`${query}\` star weapon`, "weapon"),
			);
			return;
		}
		const query = args.join(" ");
		var data = await genshin.weapons(query);
		if (!data)
			return message.reply(`Search for \`${query}\` returned no result.`);

		var pages = [];
		var refineStats = table(
			[
				["+ Level", "|", "1", "|", "2", "|", "3", "|", "4", "|", "5"],
				[
					"- %",
					"|",
					data.r1,
					"|",
					data.r2,
					"|",
					data.r3,
					"|",
					data.r4,
					"|",
					data.r5,
				],
			],
			{ align: ["l", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r"] },
		);

		var embed = new BreezusEmbed(message)
			.setTitle(`${data.name}`, data.url.fandom)
			.setDescription(
				stripIndents`
		${data.description}
		
		> **Weapon Type:** ${data.weapontype}
		> **Weapon Material Type:** ${data.weaponmaterialtype}
		> **Base ATK:** ${data.baseatk}
		> **Substat:** ${data.substat}
		> **Subvalue:** ${data.subvalue}
		> **Effect:** ${data.effectname} | ${data.effect}
		> **Star Rating:** ${
			data.rarity
		} Stars <a:genshinStarRating:847385006775205888> 
		> ${"<a:genshinStar:847384776385757206>".repeat(data.rarity)}
		`,
			)
			.addField(
				"Refinement",
				stripIndents`
		>>> \`\`\`diff
		${refineStats}
		\`\`\`
		`,
				false,
			)
			.setThumbnail(data.images.image);
		pages.push(embed);

		var statsArr = [
			["+ Level", "|", "ATK", "|", "Specialised"],
			[
				"- Lvl 1",
				"|",
				Math.round(data.stats(1).attack),
				"|",
				data.stats(1).specialized.toFixed(4),
			],
		];
		for (let i = 1; i < 10; i++) {
			statsArr.push([
				`- Lvl ${10 * i}`,
				"|",
				Math.round(data.stats(10 * i).attack),
				"|",
				data.stats(10 * i).specialized.toFixed(4),
			]);
		}
		var statsTable = table(statsArr, { align: ["l", "r", "r", "r"] });

		var embed = new BreezusEmbed(message)
			.setTitle(`${data.name}`, data.url.fandom)
			.setDescription(
				stripIndents`
		Base stats for ${data.name} without bonuses.
		>>> \`\`\`diff
		${statsTable}
		\`\`\`
		`,
			)
			.setThumbnail(data.images.image);
		pages.push(embed);
		paginationEmbed(message, pages);
	}
};
