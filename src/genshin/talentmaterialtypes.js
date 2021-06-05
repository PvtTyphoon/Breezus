const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const genshin = require("genshin-db");
const { paginationEmbed, genshinChunkData } = require("../../util/pagination");

module.exports = class genshinCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "talentmaterialtypes",
			aliases: [
				"talentmaterialtypes",
				"tpmt",
				"tmt",
				"talentmt",
				"tmaterialtypes",
				"talentmat",
			],
			group: "genshin",
			memberName: "talentmaterialtypes",
			description: stripIndents`
			Talent material type lookup for Genshin Impact.
			Adding the -c flag to your query will search for categories.
			> Example Usage: .talentmaterialtypes [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) {
			var data = await genshin.talentmaterialtypes("names", {
				matchCategories: true,
			});
			paginationEmbed(
				message,
				genshinChunkData(message, data, "talent material types", "talentmat"),
			);
			return;
		}
		if (args.includes("-c")) {
			const query = args.filter((flag) => flag !== "-c").join(" ");
			var data = await genshin.talentmaterialtypes(query, {
				matchCategories: true,
			});
			if (!data)
				return message.reply(`Search for \`${query}\` returned no result.`);
			paginationEmbed(
				message,
				genshinChunkData(
					message,
					data,
					`\`${query}\` talent material type`,
					"talentmat",
				),
			);
			return;
		}
		const query = args.join(" ");
		var data = await genshin.talentmaterialtypes(query);
		if (!data)
			return message.reply(`Search for \`${query}\` returned no result.`);
		var embed = new BreezusEmbed(message).setTitle(data.name)
			.setDescription(stripIndents`
		  		  Located in **${data.location}** in the region of **${
			data.region
		}**, and is mastered in the domain of **${data.domainofmastery}**.
		  		  Available on **${data.day.join(", ")}**
		  		  > 2 Star: **${
							data["2starname"]
						}** ${"<a:genshinStar:847384776385757206>".repeat(2)}
		  		  > 3 Star: **${
							data["3starname"]
						}** ${"<a:genshinStar:847384776385757206>".repeat(3)}
		  		  > 4 Star: **${
							data["4starname"]
						}** ${"<a:genshinStar:847384776385757206>".repeat(4)}
		  		  > 5 Star: **${
							data["5starname"]
						}** ${"<a:genshinStar:847384776385757206>".repeat(5)}
		  `);
		message.channel.send({ embed });
	}
};
