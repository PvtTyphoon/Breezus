const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { apiRoot, keys, users } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");
const { msToTS } = require("../../util/Util");
const { shorten } = require("../../util/TextMods");

module.exports = class albumCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "album",
			group: "info",
			memberName: "album",
			description: 
				"Searches information for an album on last.fm.",
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
			data = await this.fetchAlbumData(query, message);
		} catch (err) {
			handleError(err, message);
			return;
		}
		const embed = new BreezusEmbed(message).setDescription(stripIndents`
		**Album:** [${data.album}](${data.url})
		**Artist:** ${data.artist}
		**Top Tags:** ${data.tags}
		**Listeners:** ${data.listeners} listeners
		**Playcount:** ${data.playcount} total plays
		>>> **Tracks**
		${shorten(data.tracks.join("\n"), 1500)}
		`);
		message.channel.send({ embed });
	}

	async fetchAlbumData(query, message) {
		var validateOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "album.search",
				album: query,
				api_key: keys[0],
				format: "json",
				limit: "1",
			},
		};
		const validateAlbum = await rp(validateOptions);
		if (validateAlbum.results.albummatches.album.length == 0)
			return message.channel.send(`No results found for ${query}`);
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "album.getInfo",
				album: validateAlbum.results.albummatches.album[0].name,
				artist: validateAlbum.results.albummatches.album[0].artist,
				api_key: keys[1],
				format: "json",
				limit: "1",
			},
		};
		const rData = await rp(options);
		var tracks = [];
		for (let i = 0; i < rData.album.tracks.track.length; i++) {
			tracks.push(
				`[${rData.album.tracks.track[i].name}](${
					rData.album.tracks.track[i].url
				}) \`${msToTS(rData.album.tracks.track[i].duration * 1000)}\``,
			);
		}
		var data = {
			album: rData.album.name,
			url: rData.album.url,
			artist: rData.album.artist,
			tags: rData.album.tags.tag
				.map((tag) => `[${tag.name}](${tag.url})`)
				.join(" • "),
			listeners: rData.album.listeners,
			playcount: rData.album.playcount,
			pubDate: rData.album.releasedate,
			tracks,
		};
		return data;
	}
};
