const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { apiRoot, keys, users } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");
const { notFound } = require("../../errorHandling/customErrors");

const modes = ["album", "artist", "track"];
let medals = {
	"0": "🥇  ",
	"1": "🥈  ",
	"2": "🥉  ",
	"3": " 4.    ",
	"4": " 5.    ",
	"5": " 6.    ",
	"6": " 7.    ",
	"7": " 8.    ",
	"8": " 9.    ",
	"9": " 10.  ",
	"10": " 11.  ",
	"11": " 12.  ",
	"12": " 13.  ",
	"13": " 14.  ",
	"14": " 15.  ",
	"15": " 16.  ",
	"16": " 17.  ",
	"17": " 18.  ",
	"18": " 19.  ",
	"19": " 20.  ",
	"20": " 21.  ",
	"21": " 22.  ",
	"22": " 23.  ",
	"23": " 24.  ",
	"24": " 25.  ",
};

module.exports = class listenersCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "listeners",
			aliases: ["listener", "listens", "wk"],
			group: "info",
			memberName: "listeners",
			description: stripIndents`
			Leaderboard for artists, tracks, and albums.
			\`\`\`Example Usage: .listeners [artist|track|album] [query]\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		if (!args[1])
			return message.reply(stripIndents`
	    Missing parameters.
	    Tip: Use the \`.help listeners\` command for help`);
		if (!modes.includes(args[0].toLowerCase()))
			return message.reply(stripIndents`
			${args[0]} is not a valid query type.
			Use the \`.help listeners\` command for more info.
			`);
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
			var lb = [];
			for (let i = 0; i < data.lbData.length; i++) {
				lb.push(`${medals[i]}${data.lbData[i]}`);
			}
		} catch (err) {
			handleError(err, message);
			return;
		}
		const embed = new BreezusEmbed(message)
			.setThumbnail(data.image)
			.setURL(data.url)
			.setTitle(`${data.query} ${data.secondaryTag}`)
			.setDescription(
				`**\`\`\`${data.count} people listen to this.\`\`\`**\n${lb.join(
					"\n",
				)}`,
			)
			.setFooter(`${data.listeners} listeners`);
		message.channel.send({ embed });
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
				limit: "1",
			},
		};
		const validateTrack = await rp(validateOptions);
		if (!validateTrack.results.trackmatches.track.length) throw new notFound(query);
		var lbData = [];
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "track.getInfo",
				track: validateTrack.results.trackmatches.track[0].name,
				artist: validateTrack.results.trackmatches.track[0].artist,
				api_key: keys[1],
				format: "json",
				limit: "1",
			},
		};
		var rData;
		for (let i = 0; i < users.length; i++) {
			options.qs.user = users[i];
			rData = await rp(options);
			if (rData.track.userplaycount > 0) {
				lbData.push({
					dTag: `[${users[i]}](https://www.last.fm/user/${users[i]}) : ${rData.track.userplaycount} plays`,
					sort: rData.track.userplaycount,
				});
			}
		}
		lbData.sort(function (a, b) {
			return b.sort - a.sort;
		});
		var lbData = lbData.map((lbData) => lbData.dTag);
		var data = {
			lbData,
			query: validateTrack.results.trackmatches.track[0].name,
			secondaryTag: `by \`${validateTrack.results.trackmatches.track[0].artist}\`.`,
			url: validateTrack.results.trackmatches.track[0].url,
			listeners: validateTrack.results.trackmatches.track[0].listeners,
			image:
				validateTrack.results.trackmatches.track[0].image[
					validateTrack.results.trackmatches.track[0].image.length - 1
				]["#text"],
			count: lbData.length,
		};
		return data;
	}
	async fetchAlbumData(query) {
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
		if (!validateAlbum.results.albummatches.album.length) throw new notFound(query);
		var lbData = [];
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
		var rData;
		for (let i = 0; i < users.length; i++) {
			options.qs.user = users[i];
			rData = await rp(options);
			if (rData.album.userplaycount > 0) {
				lbData.push({
					dTag: `[${users[i]}](https://www.last.fm/user/${users[i]}) : ${rData.album.userplaycount} plays`,
					sort: rData.album.userplaycount,
				});
			}
		}
		lbData.sort(function (a, b) {
			return b.sort - a.sort;
		});
		var lbData = lbData.map((lbData) => lbData.dTag);
		var data = {
			lbData,
			query: validateAlbum.results.albummatches.album[0].name,
			secondaryTag: `by \`${validateAlbum.results.albummatches.album[0].artist}\`.`,
			url: validateAlbum.results.albummatches.album[0].url,
			listeners: rData.album.listeners,
			image:
				validateAlbum.results.albummatches.album[0].image[
					validateAlbum.results.albummatches.album[0].image.length - 1
				]["#text"],
			count: lbData.length,
		};
		return data;
	}
	async fetchArtistData(query) {
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
		if (!validateArtist.results.artistmatches.artist.length) throw new notFound(query);
		var lbData = [];
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "artist.getInfo",
				artist: validateArtist.results.artistmatches.artist[0].name,
				api_key: keys[1],
				format: "json",
				limit: "1",
			},
		};
		var rData;
		for (let i = 0; i < users.length; i++) {
			options.qs.user = users[i];
			rData = await rp(options);
			if (rData.artist.stats.userplaycount > 0) {
				lbData.push({
					dTag: `[${users[i]}](https://www.last.fm/user/${users[i]}) : ${rData.artist.stats.userplaycount} plays`,
					sort: rData.artist.stats.userplaycount,
				});
			}
		}
		lbData.sort(function (a, b) {
			return b.sort - a.sort;
		});
		var lbData = lbData.map((lbData) => lbData.dTag);
		var data = {
			lbData,
			query: validateArtist.results.artistmatches.artist[0].name,
			secondaryTag: ``,
			url: validateArtist.results.artistmatches.artist[0].url,
			listeners: rData.artist.stats.listeners,
			image:
				validateArtist.results.artistmatches.artist[0].image[
					validateArtist.results.artistmatches.artist[0].image.length - 1
				]["#text"],
			count: lbData.length,
		};
		return data;
	}
};
