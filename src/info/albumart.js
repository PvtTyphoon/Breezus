const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { apiRoot, keys } = require("../../config.json");
const { notFound } = require("../../errorHandling/customErrors");
const { stripIndents } = require("common-tags");
const { handleError } = require("../../errorHandling/errorHandling");
const { paginationEmbed } = require("../../util/pagination");

module.exports = class albumartCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "albumart",
			group: "info",
			memberName: "albumart",
			description: stripIndents`
			Album and album cover lookup.
			> Example Usage: .albumart [query]
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
		var pages = [];
		for (let i = 0; i < data.length; i++) {
			const embed = new BreezusEmbed(message)
				.setDescription(`URL: [Click Me.](${data[i].link})`)
				.setImage(data[i].cover.replace("300x300", "4096x4096"))
				.addField("❯ Album", data[i].name, true)
				.addField("❯ Artist", data[i].artist, true);
			pages.push(embed);
		}
		paginationEmbed(message, pages);
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
				limit: "50",
			},
		};
		const rData = await rp(options);
		var data = [];
		if (!rData.results.albummatches.album.length) throw new notFound(args);
		for (let i = 0; i < rData.results.albummatches.album.length; i++) {
			data.push({
				cover:
					rData.results.albummatches.album[i].image[
						rData.results.albummatches.album[i].image.length - 1
					]["#text"],
				link: rData.results.albummatches.album[i].url,
				name: rData.results.albummatches.album[i].name,
				artist: rData.results.albummatches.album[i].artist,
			});
		}
		return data;
	}
};
