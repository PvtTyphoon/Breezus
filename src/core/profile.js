const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { notEnoughDataError } = require("../../errorHandling/customErrors");
const { apiRoot, keys, imgurID } = require("../../config.json");
const { stripIndents } = require("common-tags");

var imgur = require("imgur");
imgur.setClientId(imgurID);
imgur.getClientId();

module.exports = class profileCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "profile",
			aliases: ["p"],
			group: "core",
			memberName: "profile",
			description: stripIndents`
			Displays a user profile.
			\`\`\`Example Usage: .p <user>\`\`\`
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
			const canvas = createCanvas(1500, 1500);
			const ctx = canvas.getContext("2d");
			let xOff = 0;
			let yOff = 0;
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, 1500, 1500);
			for (let i = 0; i < 25; i++) {
				const album_ = data.albums[i];
				if (album_.image[album_.image.length - 1]["#text"] !== "") {
					const albumArt = await loadImage(
						album_.image[album_.image.length - 1]["#text"],
					);
					ctx.drawImage(albumArt, xOff, yOff);
				} else {
					const albumArt = await loadImage(
						"https://i-really-should.go-get-a.life/DcfTOP.jpeg",
					);
					ctx.drawImage(albumArt, xOff, yOff);
				}
				ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
				ctx.fillRect(xOff, yOff, xOff + 300, yOff + 300);
				ctx.fillStyle = "white";
				ctx.font = `20px Noto`;
				ctx.fillText(album_.artist.name, xOff + 24, yOff + 300 - 24);
				ctx.fillText(album_.name, xOff + 24, yOff + 300 - 48);
				xOff += 300;
				if (xOff >= 1500) {
					xOff = 0;
					yOff += 300;
				}
			}
			const stream = canvas.toDataURL("image/jpg", 0.9).split(",")[1];
			imgur
				.uploadBase64(stream)
				.then(function (json) {
					const embed = new BreezusEmbed(message)
						.setDescription(
							`[View profile for ${data.username}](${data.url})\nCountry : ${
								data.country
							}\nReal Name : ${
								data.name
							}\nJoined ${data.registered.toUTCString()}`,
						)
						.addField(`❯ Top 5 Tracks`, topTracks.join("\n"), false)
						.addField(`❯ Top 5 Albums`, topAlbums.join("\n"), false)
						.addField(`❯ Top 5 Artists`, topArtists.join("\n"), false)
						.addField(
							`Library`,
							`Tracks: ${data.trackCount}\nAlbums: ${data.albumCount}\nArtists: ${data.artistCount}`,
							false,
						)
						.setThumbnail(data.avatar.replace(/jpg|jpeg|png/gi, "gif"))
						.setImage(json.data.link);
					message.channel.send({ embed });
				})
				.catch(function (err) {
					message.reply(`The Imgur API returned an error ${err.message}`);
				});
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

		if (trackData.toptracks.track.length < 5 || albumData.topalbums.album.length < 25 || artistData.topartists.artist.length < 5) throw new notEnoughDataError(user);

		const data = {
			username: user,
			name: rData.user.realname,
			scrobbles: rData.user.playcount,
			registered: new Date(rData.user.registered["#text"] * 1000),
			avatar: rData.user.image[rData.user.image.length -1]["#text"],
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
