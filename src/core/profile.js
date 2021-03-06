const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { notEnoughDataError } = require("../../errorHandling/customErrors");
const { apiRoot, keys } = require("../../config.json");
const { stripIndents } = require("common-tags");

module.exports = class profileCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "profile",
			aliases: ["p"],
			group: "core",
			memberName: "profile",
			description: stripIndents`
			Displays a user profile.
			> Example Usage: .p <user>
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		try {
			var userData = await getUser(message);
			var data = await this.fetchData(userData.user);
			var topAlbums = [];
			var topArtists = [];
			var topTracks = [];
			for (let i = 0; i < 5; i++) {
				topTracks.push(
					`${data.tracks[i].name} : ${data.tracks[i].playcount} scrobbles.`,
				);
				topArtists.push(
					`${data.artists[i].name} : ${data.artists[i].playcount} scrobbles.`,
				);
				topAlbums.push(
					`${data.albums[i].name} : ${data.albums[i].playcount} scrobbles.`,
				);
			}
			const embed = new BreezusEmbed(message)
				.setDescription(
					stripIndents`
							[View profile for ${data.username}](${data.url})
							Country : ${data.country}
							Real Name : ${data.name}
							Joined ${data.registered.toUTCString()}
						`,
				)
				.addField(`❯ Top 5 Tracks`, topTracks.join("\n"), false)
				.addField(`❯ Top 5 Albums`, topAlbums.join("\n"), false)
				.addField(`❯ Top 5 Artists`, topArtists.join("\n"), false)
				.addField(
					`❯ Library`,
					stripIndents`
							> Tracks: ${data.trackCount}
							> Albums: ${data.albumCount}
							> Artists: ${data.artistCount}`,
					true,
				)
				.setThumbnail(data.avatar.replace(/jpg|jpeg|png/gi, "gif"));
			message.channel.send({ embed });
		} catch (err) {
			handleError(err, message);
			return;
		}
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
				limit: "25",
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
				limit: "5",
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
				limit: "5",
			},
		};
		const trackData = await rp(trackOptions);

		if (
			trackData.toptracks.track.length < 5 ||
			albumData.topalbums.album.length < 25 ||
			artistData.topartists.artist.length < 5
		)
			throw new notEnoughDataError(user);

		const data = {
			username: user,
			name: rData.user.realname,
			scrobbles: rData.user.playcount,
			registered: new Date(rData.user.registered["#text"] * 1000),
			avatar: rData.user.image[rData.user.image.length - 1]["#text"],
			url: rData.user.url,
			country: rData.user.country,
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
