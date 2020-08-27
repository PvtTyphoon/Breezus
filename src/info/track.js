const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { apiRoot, keys, users } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");
const { shorten } = require("../../util/TextMods");

module.exports = class trackCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "track",
			group: "info",
			memberName: "track",
			description: stripIndents`
			Searches for track information on last.fm.
			\`\`\`Example Usage: .track [track name]\`\`\`
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
			data = await this.fetchTrackData(query, message);
		} catch (err) {
			message.channel.send(stripIndents`
			Last.fm failed to provide a complete wiki for this track.
			`)
			return;
		}
		const embed = new BreezusEmbed(message).setDescription(stripIndents`
		**Track:** [${data.track}](${data.url})
		**Album:** [${data.album}](${data.albumURL})
		**Artist:** ${data.artist}
		**Top Tags:** ${data.tags}
		**Listeners:** ${data.listeners} listeners
		**Playcount:** ${data.playcount} total plays
		
		>>> **Summary:**
		${data.wiki}
		`);
		message.channel.send({ embed });
	}

	async fetchTrackData(query, message) {
		var validateOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "track.search",
				track: query,
				api_key: keys[0],
				format: "json",
				limit: "1",
			},
		};
		const validateTrack = await rp(validateOptions);
		if (validateTrack.results.trackmatches.track.length == 0)
			return message.channel.send(`No results found for ${query}`);
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "track.getInfo",
				mbid: validateTrack.results.trackmatches.track[0].mbid,
				api_key: keys[1],
				format: "json",
				limit: "1",
			},
		};
		const rData = await rp(options);
		var data = {
			track: rData.track.name,
			url: rData.track.url,
			artist: rData.track.artist.name,
			album: rData.track.album.title,
			albumURL: rData.track.album.url,
			tags: rData.track.toptags.tag
				.map((tag) => `[${tag.name}](${tag.url})`)
				.join(" • "),
			listeners: rData.track.listeners,
			playcount: rData.track.playcount,
			wiki: shorten(rData.track.wiki.content, 1500),
		};
		return data;
	}
};
