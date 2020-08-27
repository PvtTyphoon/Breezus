const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { colourGen } = require("../../util/Util");
const { apiRoot, keys } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");
const { stripIndents } = require("common-tags");

module.exports = class geoArtistCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "geoartists",
			group: "info",
			memberName: "geoartists",
			description: stripIndents`
			Displays geoartists as provided by lastfm. If specifying a country ISO-3166-1 naming conventions apply - <https://en.m.wikipedia.org/wiki/ISO_3166-1>.
			\`\`\`Example Usage: .geoartists [query]\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		let args = message.content.trim().split(/ +/g).slice(1);
		if (args.length === 0)
			return message.reply(
				`Please provide a search query. Use the help command for more information.`,
			);
		const country = args.join(" ");
		var data;
		try {
			data = await this.fetchData(country);
		} catch (err) {
			handleError(err, message);
			return;
		}
		const embed = new BreezusEmbed(message)
			.setTitle(country)
			.setDescription(data.join("\n"));
		message.channel.send({ embed });
	}

	async fetchData(country) {
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "geo.gettopartists",
				country: country,
				api_key: keys[0],
				format: "json",
				limit: "25",
			},
		};
		const rData = await rp(options);

		const data = [];
		for (let i = 0; i < 25; i++) {
			data.push(
				`${i + 1}. [${rData.topartists.artist[i].name}](${
					rData.topartists.artist[i].url
				}): ${rData.topartists.artist[i].listeners} listeners.`,
			);
		}
		return data;
	}
};
