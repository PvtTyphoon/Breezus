const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { apiRoot, keys } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");
const { notFound } = require("../../errorHandling/customErrors");
const { paginationEmbed } = require("../../util/pagination");

const modes = ["album", "artist", "track"];

module.exports = class searchCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "search",
			aliases: ["page"],
			group: "info",
			memberName: "search",
			description: stripIndents`
			Searches for an artist, album, or track on last.fm and links to it's page.
			> Example Usage: .search [artist|album|track] [query]
			`,
		});
	}

	// Duplicates code follows because im lazy and vertical space is free
	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		if (!args[1])
			return message.reply(stripIndents`
	    Missing parameters.
	    Tip: Use the \`.help listeners\` command for help`);
		if (!modes.includes(args[0].toLowerCase()))
			return message.reply(`${args[0]} is not a valid query type.
	    Use the \`.help listeners\` command for more info.`);
		const query = args.slice(1).join(" ");
		var data;
		try {
			switch (args[0].toLowerCase()) {
				case "track":
					data = await this.fetchTrackData(query);
					break;
				case "album":
					data = await this.fetchAlbumData(query);
					break;
				case "artist":
					data = await this.fetchArtistData(query);
					break;
			}
		} catch (err) {
			handleError(err, message);
			return;
		}
		var pages = [];
		for (let i = 0; i < data.length; i++) {
			const embed = new BreezusEmbed(message).setDescription(stripIndents`
				    		**${data[i].description}**
				    		Top result on last.fm:
				    		${data[i].link}
				    		 
				    		${data[i].information}
				    		`);
			pages.push(embed);
		}
		paginationEmbed(message, pages);
	}

	async fetchTrackData(query) {
		var validateOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "track.search",
				track: query,
				api_key: keys[0],
				format: "json",
				limit: "25",
			},
		};
		const validateTrack = await rp(validateOptions);
		if (!validateTrack.results.trackmatches.track[0]) throw new notFound(query);
		var data = [];
		for (let i = 0; i < validateTrack.results.trackmatches.track.length; i++) {
			data.push({
				description: `Track lookup for \`${query}\``,
				information: stripIndents`
			Track: ${validateTrack.results.trackmatches.track[i].name}
			Artist: ${validateTrack.results.trackmatches.track[i].artist}
			Listeners: ${validateTrack.results.trackmatches.track[i].listeners}
			`,
				link: validateTrack.results.trackmatches.track[i].url,
			});
		}
		return data;
	}
	async fetchAlbumData(query) {
		var validateOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "album.search",
				album: query,
				api_key: keys[1],
				format: "json",
				limit: "25",
			},
		};
		const validateAlbum = await rp(validateOptions);
		if (!validateAlbum.results.albummatches.album[0]) throw new notFound(query);
		var data = [];
		for (let i = 0; i < validateAlbum.results.albummatches.album.length; i++) {
			data.push({
				description: `Album lookup for \`${query}\``,
				information: stripIndents`
			Album: ${validateAlbum.results.albummatches.album[i].name}
			Artist: ${validateAlbum.results.albummatches.album[i].artist}
			`,
				link: validateAlbum.results.albummatches.album[i].url,
			});
		}
		return data;
	}
	async fetchArtistData(query) {
		var validateOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "artist.search",
				artist: query,
				api_key: keys[2],
				format: "json",
				limit: "25",
			},
		};
		const validateArtist = await rp(validateOptions);
		if (!validateArtist.results.artistmatches.artist[0])
			throw new notFound(query);
		var data = [];
		for (
			let i = 0;
			i < validateArtist.results.artistmatches.artist.length;
			i++
		) {
			data.push({
				description: `Artist lookup for \`${query}\``,
				information: stripIndents`
			Artist: ${validateArtist.results.artistmatches.artist[i].name}
			Listeners: ${validateArtist.results.artistmatches.artist[i].listeners}
			`,
				link: validateArtist.results.artistmatches.artist[i].url,
			});
		}
		return data;
	}
};
