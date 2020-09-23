const BreezusCommand = require("../../classes/command");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { apiRoot, keys } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");
const { notFound } = require("../../errorHandling/customErrors");
const { getUser } = require("../../util/chartsUserGetter");
const modes = ["track", "album", "artist"];

module.exports = class playcountCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "playcount",
			aliases: ["pc"],
			group: "core",
			memberName: "playcount",
			description: stripIndents`
			Playcount for artists, tracks, and albums.
			\`\`\`Example Usage: .pc [artist|track|album] [query] | <user>\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const querystring = message.content.trim().split("|")[0];
		const args = querystring.trim().split(/ +/g).slice(1);
		if (!args[1])
			return message.reply(stripIndents`
	    Missing parameters.
	    Tip: Use the \`.help pc\` command for help`);
		if (!modes.includes(args[0].toLowerCase()))
			return message.reply(stripIndents`
			${args[0]} is not a valid query type.
			Use the \`.help pc\` command for more info.
			`);
		const query = args.slice(1).join(" ");
		var data;
		try {
			var userData = await getUser(message);
			switch (args[0].toLowerCase()) {
				case "track":
					data = await this.fetchTrackData(query, userData.user);
					break;
				case "album":
					data = await this.fetchAlbumData(query, userData.user);
					break;
				case "artist":
					data = await this.fetchArtistData(query, userData.user);
					break;
			}
		} catch (err) {
			handleError(err, message);
			return;
		}
		message.channel.send(data);
	}

	async fetchTrackData(query, user) {
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
		if (!validateTrack.results.trackmatches.track.length)
			throw new notFound(query);
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "track.getInfo",
				track: validateTrack.results.trackmatches.track[0].name,
				artist: validateTrack.results.trackmatches.track[0].artist,
				api_key: keys[1],
				user: user,
				format: "json",
				limit: "1",
			},
		};
		var rData = await rp(options);
		var data = `${user} has ${rData.track.userplaycount} plays of \`${validateTrack.results.trackmatches.track[0].name}\``;
		return data;
	}
	async fetchAlbumData(query, user) {
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
		if (!validateAlbum.results.albummatches.album.length)
			throw new notFound(query);
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "album.getInfo",
				album: validateAlbum.results.albummatches.album[0].name,
				artist: validateAlbum.results.albummatches.album[0].artist,
				api_key: keys[1],
				user: user,
				format: "json",
				limit: "1",
			},
		};
		var rData = await rp(options);
		var data = `\`${user}\` has **${rData.album.userplaycount}** plays of __${validateAlbum.results.albummatches.album[0].name}__`;
		return data;
	}
	async fetchArtistData(query, user) {
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
		if (!validateArtist.results.artistmatches.artist.length)
			throw new notFound(query);
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "artist.getInfo",
				artist: validateArtist.results.artistmatches.artist[0].name,
				api_key: keys[1],
				user: user,
				format: "json",
				limit: "1",
			},
		};
		var rData = await rp(options);
		var data = `${user} has ${rData.artist.stats.userplaycount} plays of \`${validateArtist.results.artistmatches.artist[0].name}\``;
		return data;
	}
};
