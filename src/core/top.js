const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { notEnoughDataError } = require("../../errorHandling/customErrors");
const { apiRoot, keys } = require("../../config.json");

module.exports = class topCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "top",
			aliases: ["top10"],
			group: "core",
			memberName: "top",
			description: stripIndents`
			Displays the top artists, albums, and tracks.
			\`\`\`Example Usage: .top <user>\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		let userData = await getUser(message);
		if (userData.error) return message.reply(userData.error);
		var data;
		try {
			data = await this.fetchData(userData.user);
		} catch (err) {
			handleError(err, message);
			return;
		}
		var topAlbums = [];
		var topArtists = [];
		var topTracks = [];
		for (let i = 0; i < 10; i++) {
			topTracks.push(
				`${[i + 1]}.${data.tracks[i].name} : ${
					data.tracks[i].playcount
				} scrobbles.`,
			);
			topArtists.push(
				`${[i + 1]}. ${data.artists[i].name} : ${
					data.artists[i].playcount
				} scrobbles.`,
			);
			topAlbums.push(
				`${[i + 1]}. ${data.albums[i].name} : ${
					data.albums[i].playcount
				} scrobbles.`,
			);
		}

		const embed = new BreezusEmbed(message)
			.setDescription(
				`[View profile for ${data.username}](${
					data.url
				})\nJoined ${data.registered.toUTCString()}`,
			)
			.addField(
				`❯ Top 10 Tracks`,
				stripIndents`
			[Link to last.fm page](https://www.last.fm/user/${data.username}/library/tracks)
			${topTracks.join("\n")}
			`,
				false,
			)
			.addField(
				`❯ Top 10 Albums`,
				stripIndents`
			[Link to last.fm page](https://www.last.fm/user/${data.username}/library/albums)
			${topAlbums.join("\n")}
			`,
				false,
			)
			.addField(
				`❯ Top 10 Artists`,
				stripIndents`
			[Link to last.fm page](https://www.last.fm/user/${
				data.username
			}/library/artists)
			${topArtists.join("\n")}
			`,
				false,
			)
			.addField(
				`Library`,
				stripIndents`
				Tracks: ${data.trackCount}
				Albums: ${data.albumCount}
				Artists: ${data.artistCount}
				`,
				false,
			);
		message.channel.send({ embed });
	}

	async fetchData(user) {
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getInfo",
				user: user,
				api_key: keys[0],
				format: "json",
			},
		};
		const rData = await rp(options);

		var albumOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettopalbums",
				user: user,
				api_key: keys[1],
				format: "json",
				limit: "10",
			},
		};
		const albumData = await rp(albumOptions);

		var artistOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettopartists",
				user: user,
				api_key: keys[2],
				format: "json",
				limit: "10",
			},
		};
		const artistData = await rp(artistOptions);

		var trackOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettoptracks",
				user: user,
				api_key: keys[3],
				format: "json",
				limit: "10",
			},
		};
		const trackData = await rp(trackOptions);

		if(trackData.toptracks.track.length < 10 || albumData.topalbums.album.length < 10 || artistData.topartists.artist.length < 10) throw new notEnoughDataError(user);

		const data = {
			username: user,
			scrobbles: rData.user.playcount,
			url: rData.user.url,
			registered: new Date(rData.user.registered["#text"] * 1000),
			tracks: trackData.toptracks.track,
			trackCount: trackData.toptracks["@attr"].total,
			artists: artistData.topartists.artist,
			artistCount: artistData.topartists["@attr"].total,
			albums: albumData.topalbums.album,
			albumCount: albumData.topalbums["@attr"].total,
		};
		return data;
	}
};
