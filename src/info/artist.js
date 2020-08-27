const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { apiRoot, keys, users } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");
const { msToTS } = require("../../util/Util");
const { shorten } = require("../../util/TextMods");

module.exports = class artistCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "artist",
			group: "info",
			memberName: "artist",
			description: stripIndents`
			Searches for artist information on last.fm.
			\`\`\`.artist [query]\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		if (!args[0]) message.reply("No query provided.");
		const query = args.join(" ");
		var data;
		try {
			data = await this.fetchArtistData(query, message);
		} catch (err) {
			handleError(err, message);
			return;
		}
		const embed = new BreezusEmbed(message)
			.setDescription(
				stripIndents`
		**Artist:** [${data.artist}](${data.url})
		**Top Tags:** ${data.tags}
		**Listeners:** ${data.listeners} listeners
		**Playcount:** ${data.playcount} total plays
		>>> **Summary**
		${shorten(data.wiki, 1500)}
		`,
			)
			.addField(
				"Similar Artists",
				shorten(data.similar.join("\n"), 1000),
				false,
			);
		message.channel.send({ embed });
	}

	async fetchArtistData(query, message) {
		var validateOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "artist.search",
				artist: query,
				api_key: keys[0],
				format: "json",
				limit: "1",
			},
		};
		const validateArtist = await rp(validateOptions);
		if (validateArtist.results.artistmatches.artist.length == 0)
			return message.channel.send(`No results found for ${query}`);
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "artist.getInfo",
				mbid: validateArtist.results.artistmatches.artist[0].mbid,
				api_key: keys[1],
				format: "json",
				limit: "1",
			},
		};
		const rData = await rp(options);
		var data = {
			artist: rData.artist.name,
			url: rData.artist.url,
			tags: rData.artist.tags.tag
				.map((tag) => `[${tag.name}](${tag.url})`)
				.join(" • "),
			listeners: rData.artist.stats.listeners,
			playcount: rData.artist.stats.playcount,
			wiki: shorten(rData.artist.bio.content, 1500),
			similar: rData.artist.similar.artist.map(
				(artist) => `[${artist.name}](${artist.url})`,
			),
		};
		return data;
	}
};
