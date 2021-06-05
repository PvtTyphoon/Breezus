const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const genshin = require("genshin-db");
const { paginationEmbed, genshinChunkData } = require("../../util/pagination");
const { shorten } = require("../../util/TextMods");
const table = require("text-table");

module.exports = class genshinCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "talent",
			aliases: ["talents"],
			group: "genshin",
			memberName: "talent",
			description: stripIndents`
			Talent lookup for Genshin Impact.
			Adding the -c flag to your query will search for categories.
			> Example Usage: .talent [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		var args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) {
			var data = await genshin.talents("names", { matchCategories: true });
			paginationEmbed(message, genshinChunkData(message, data, "talent"));
			return;
		}
		const query = args.join(" ");
		var data = await genshin.talents(query);
		if (!data)
			return message.reply(`Search for \`${query}\` returned no result.`);
		var image = await genshin.characters(query).images.cover2;
		var pages = [];

		var embed = new BreezusEmbed(message)
			.setTitle(data.name)
			.setThumbnail(image).setDescription(stripIndents`
		**Combat 1: Normal, Charged, & Plunge Attack**
		>>> ${data.combat1.name}
		${data.combat1.info}
		`);
		pages.push(embed);
		var statsArr1 = [["+ /", "|", "1", "|", "7", "|", "15"]];
		for (let i = 0; i < data.combat1.attributes.labels.length + 1; i++) {
			var dLabel = data.combat1.attributes.labels[i]
				? data.combat1.attributes.labels[i]
						.trim()
						.split("|")
						.slice(0, 1)[0]
						.replace("DMG per ", "")
						.replace("DMG", "")
						.replace("Stamina Cost", "")
						.replace("Attack", "ATK")
				: " ";
			statsArr1.push([
				`- ${dLabel}`,
				"|",
				eval(
					"data.combat1.attributes.parameters.param" + (1 + i) + "[0]",
				).toFixed(2),
				"|",
				eval(
					"data.combat1.attributes.parameters.param" + (1 + i) + "[6]",
				).toFixed(2),
				"|",
				eval(
					"data.combat1.attributes.parameters.param" + (1 + i) + "[14]",
				).toFixed(2),
			]);
		}
		var embed = new BreezusEmbed(message)
			.setTitle(data.name)
			.setThumbnail(image).setDescription(stripIndents`
				  **Increase by level**
				  >>> \`\`\`diff
				  ${table(statsArr1, { align: ["l", "r", "r", "r", "r", "r", "r", "r", "r"] })}
				  \`\`\`
				  `);
		pages.push(embed);

		var embed = new BreezusEmbed(message)
			.setTitle(data.name)
			.setThumbnail(image).setDescription(stripIndents`
		**Combat 2: Elemental Skill**
		>>> ${data.combat2.name}
		${data.combat2.info}
		`);
		pages.push(embed);

		var statsArr2 = [["+ /", "|", "1", "|", "5", "|", "10", "|", "15"]];
		for (let i = 0; i < data.combat2.attributes.labels.length; i++) {
			var dLabel = data.combat2.attributes.labels[i]
				? data.combat2.attributes.labels[i]
						.trim()
						.split("|")
						.slice(0, 1)[0]
						.replace("DMG per ", "")
						.replace("DMG", "")
						.replace("Attack", "ATK")
				: " ";
			statsArr2.push([
				`- ${dLabel}`,
				"|",
				eval(
					"data.combat2.attributes.parameters.param" + (1 + i) + "[0]",
				).toFixed(2),
				"|",
				eval(
					"data.combat2.attributes.parameters.param" + (1 + i) + "[4]",
				).toFixed(2),
				"|",
				eval(
					"data.combat2.attributes.parameters.param" + (1 + i) + "[9]",
				).toFixed(2),
				"|",
				eval(
					"data.combat2.attributes.parameters.param" + (1 + i) + "[14]",
				).toFixed(2),
			]);
		}
		var embed = new BreezusEmbed(message)
			.setTitle(data.name)
			.setThumbnail(image).setDescription(stripIndents`
		  **Increase by level**
		  >>> \`\`\`diff
		  ${table(statsArr2, { align: ["l", "r", "r", "r", "r", "r", "r", "r", "r"] })}
		  \`\`\`
		  `);
		pages.push(embed);

		var embed = new BreezusEmbed(message)
			.setTitle(data.name)
			.setThumbnail(image).setDescription(stripIndents`
		**Combat 3: Elemental Burst**
		>>> ${data.combat3.name}
		${data.combat3.info}
		`);
		pages.push(embed);

		var statsArr3 = [["+ /", "|", "1", "|", "7", "|", "15"]];
		for (let i = 0; i < data.combat3.attributes.labels.length; i++) {
			var dLabel = data.combat3.attributes.labels[i]
				? data.combat3.attributes.labels[i]
						.trim()
						.split("|")
						.slice(0, 1)[0]
						.replace("DMG per ", "")
						.replace("DMG", "")
						.replace("Stamina Cost", "")
						.replace("Attack", "ATK")
				: " ";
			statsArr3.push([
				`- ${dLabel}`,
				"|",
				eval(
					"data.combat3.attributes.parameters.param" + (1 + i) + "[0]",
				).toFixed(2),
				"|",
				eval(
					"data.combat3.attributes.parameters.param" + (1 + i) + "[6]",
				).toFixed(2),
				"|",
				eval(
					"data.combat3.attributes.parameters.param" + (1 + i) + "[14]",
				).toFixed(2),
			]);
		}
		var embed = new BreezusEmbed(message)
			.setTitle(data.name)
			.setThumbnail(image).setDescription(stripIndents`
		  **Increase by level**
		  >>> \`\`\`diff
		  ${table(statsArr3, { align: ["l", "r", "r", "r", "r", "r", "r", "r", "r"] })}
		  \`\`\`
		  `);
		pages.push(embed);

		var embed = new BreezusEmbed(message)
			.setTitle(data.name)
			.setThumbnail(image)
			.addField(
				`Passive 1`,
				stripIndents`
		>>> ${data.passive1.name}
		${shorten(data.passive1.info, 1000)}
		`,
				false,
			)
			.addField(
				`Passive 2`,
				stripIndents`
		>>> ${data.passive2.name}
		${shorten(data.passive2.info, 1000)}
		`,
				false,
			)
			.addField(
				`Passive 3`,
				stripIndents`
		>>> ${data.passive3.name}
		${shorten(data.passive3.info, 1000)}
		`,
				false,
			);
		pages.push(embed);
		paginationEmbed(message, pages);
	}
};
