const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { notEnoughDataError } = require("../../errorHandling/customErrors");
const { apiRoot, keys } = require("../../config.json");

module.exports = class lfmCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "lfm",
			aliases: ["fm", "lastfm"],
			group: "core",
			memberName: "lastfm",
			description:
				"Displays an embed with the currently playing song and other basic data.",
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

		const embed = new BreezusEmbed(message)
			.setDescription(
				stripIndents`${data.description}
				[View Profile](${data.purl}) for ${userData.user}`,
			)
			.setThumbnail(data.cover)
			.addField(
				"❯ Track",
				stripIndents`[${data.trackName}](${data.trackURL})
			(on ${data.album})`,
				false,
			)
			.addField("❯ Artist", data.artist, false)
			.addField(
				"❯ Last track",
				stripIndents`[${data.lastTrackName}](${data.lastTrackURL})
				(on ${data.lastAlbum})`,
				false,
			)
			.addField("❯ Last artist", data.lastArtist, false)
			.setFooter(`Scrobbled ${data.scrobbles} tracks.`);
		message.channel.send({ embed });
	}

	async fetchData(user) {
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getrecenttracks",
				user: user,
				api_key: keys[0],
				format: "json",
				limit: "2",
			},
		};
		const rData = await rp(options);

		if(rData.recenttracks.track.length < 1) throw new notEnoughDataError(user);

		const data = {
			artist: rData.recenttracks.track[0].artist["#text"],
			trackName: rData.recenttracks.track[0].name,
			trackURL: rData.recenttracks.track[0].url,
			album: rData.recenttracks.track[0].album["#text"],
			cover: rData.recenttracks.track[0].image[rData.recenttracks.track[0].image.length -1]["#text"],
			lastArtist: rData.recenttracks.track[1].artist["#text"],
			lastTrackName: rData.recenttracks.track[1].name,
			lastTrackURL: rData.recenttracks.track[1].url,
			lastAlbum: rData.recenttracks.track[1].album["#text"],
			lastCover: rData.recenttracks.track[1].image[rData.recenttracks.track[1].image.length -1]["#text"],
			name: rData.recenttracks["@attr"].user,
			scrobbles: rData.recenttracks["@attr"].total,
			purl: `https://www.last.fm/user/${rData.recenttracks["@attr"].user}`,
			description: !rData.recenttracks.track[0]["@attr"]
				? `Currently not listening. Last scrobbled at ${rData.recenttracks.track[0].date["#text"]}. `
				: "Now scrobbling. ",
		};
		return data;
	}
};
