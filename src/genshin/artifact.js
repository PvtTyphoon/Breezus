const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const genshin = require("genshin-db");
const { paginationEmbed, genshinChunkData } = require("../../util/pagination");

module.exports = class genshinCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "artifact",
			aliases: ["artifacts"],
			group: "genshin",
			memberName: "artifact",
			description: stripIndents`
			Artifact lookup for Genshin Impact.
			Adding the -c flag to your query will search for categories.
			> Example Usage: .artifact [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) {
			var data = await genshin.artifacts("names", { matchCategories: true });
			paginationEmbed(message, genshinChunkData(message, data, "artifact"));
			return;
		}
		if (args.includes("-c")) {
			const query = args.filter((flag) => flag !== "-c").join(" ");
			var data = await genshin.artifacts(query, { matchCategories: true });
			if (!data)
				return message.reply(`Search for \`${query}\` returned no result.`);
			paginationEmbed(
				message,
				genshinChunkData(
					message,
					data,
					`\`${query}\` star artifact`,
					"artifact",
				),
			);
			return;
		}
		const query = args.join(" ");
		var data = await genshin.artifacts(query);
		if (!data)
			return message.reply(`Search for \`${query}\` returned no result.`);

		var pages = [];
		var artifacts = [
			data.flower,
			data.plume,
			data.sands,
			data.goblet,
			data.circlet,
		];
		var artifactNames = ["Flower", "Plume", "Sands", "Goblet", "Circlet"];
		var artifactImages = [
			data.images.flower,
			data.images.plume,
			data.images.sands,
			data.images.goblet,
			data.images.circlet,
		];
		for (let i = 0; i < 5; i++) {
			var embed = new BreezusEmbed(message)
				.setTitle(data.name, data.url.fandom)
				.setDescription(
					stripIndents`
		**Rarities:** ${data.rarity[0]} <a:genshinStar:847384776385757206> / ${data.rarity[1]} <a:genshinStar:847384776385757206>
		**2 piece bonus:** ${data["2pc"]}
		**4 piece bonus:** ${data["4pc"]}
		
		**${artifactNames[i]}**
		**Name:** ${artifacts[i].name}
		**Relic Type:** ${artifacts[i].relictype}
		>>> ${artifacts[i].description}
		  `,
				)
				.setThumbnail(artifactImages[i]);
			pages.push(embed);
		}
		paginationEmbed(message, pages);
	}
};
