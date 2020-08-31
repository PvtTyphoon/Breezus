const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { apiRoot, keys } = require("../../config.json");
const { notFound } = require("../../errorHandling/customErrors");
const { stripIndents } = require("common-tags");
const { handleError } = require("../../errorHandling/errorHandling");
module.exports = class albumCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "albumart",
			group: "info",
			memberName: "albumart",
			description: stripIndents`
			Album and album cover lookup.
			\`\`\`Example Usage: .albumart [query]\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		try {
			var data = await this.fetchData(message);
		} catch (err) {
			handleError(err, message);
			return;
		}
		// Lol fuck you lastfm imma bodge this shit
		const embed = new BreezusEmbed(message)
			.setImage(data.cover.replace("300x300", "4096x4096"))
			.addField("❯ Album", data.name, true)
			.addField("❯ Artist", data.artist, true);
		message.channel.send(`URL: ${data.link}`, { embed });
	}

	async fetchData(message) {
		let args = message.content.trim().split(/ +/g).slice(1);
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "album.search",
				album: args.join(" "),
				api_key: keys[0],
				format: "json",
				limit: "1",
			},
		};
		if (!rData.results.albummatches.album.length) throw new notFound(args);
		const rData = await rp(options);
		const data = {
			cover: rData.results.albummatches.album[0].image[rData.results.albummatches.album[0].image.length -1]["#text"],
			link: rData.results.albummatches.album[0].url,
			name: rData.results.albummatches.album[0].name,
			artist: rData.results.albummatches.album[0].artist,
		};
		return data;
	}
};
