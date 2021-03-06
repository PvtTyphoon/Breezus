const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { notEnoughDataError } = require("../../errorHandling/customErrors");
const { msToTS } = require("../../util/Util");
const { apiRoot, keys } = require("../../config.json");
const { scrobble } = require("../../scrobbling/scrobble.js");

const op = {
	1: "User has loved this track. <:loved:655068079146926110>",
	0: "User has not loved this track.",
};

module.exports = class npCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "np",
			aliases: ["nowplaying"],
			group: "core",
			memberName: "nowplaying",
			description: stripIndents`
			Displays the currently playing or last played track.
			> Example Usage: .np <user>
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		try {
			var userData = await getUser(message);
			var data = await this.fetchData(userData.user);
		} catch (err) {
			handleError(err, message);
			return;
		}
		const embed = new BreezusEmbed(message)
			.setDescription(data.description)
			.addField(
				"❯ Track",
				stripIndents`
			[${data.trackName}](${data.trackURL})
			by **${data.artist}** | on **${data.album}**
			`,
				false,
			)
			.setThumbnail(data.cover)
			.addField(
				"❯ Info",
				stripIndents`
				Runtime: ${data.runtime}
				${userData.user} scrobbled this track ${data.playcount} times
				${data.liked}
				`,
				false,
			)
			.setFooter(`Scrobbled ${data.scrobbles} tracks.`);
		message.channel.send({ embed });
		if (userData.user !== "LordBreez")
			scrobble(data.trackName, data.album, data.artist);
	}

	async fetchData(user) {
		var optionsGetTrack = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getrecenttracks",
				user: user,
				api_key: keys[0],
				format: "json",
				limit: "1",
			},
		};

		const lastTrack = await rp(optionsGetTrack);
		let lastArtist = lastTrack.recenttracks.track[0].artist["#text"];
		let lastTrackName = lastTrack.recenttracks.track[0].name;

		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "track.getInfo",
				user: user,
				track: lastTrackName,
				artist: lastArtist,
				api_key: keys[0],
				format: "json",
			},
		};

		const rData = await rp(options);

		if (!lastTrack.recenttracks.track.length)
			throw new notEnoughDataError(user);

		const data = {
			artist: lastTrack.recenttracks.track[0].artist["#text"],
			album: lastTrack.recenttracks.track[0].album["#text"],
			trackName: lastTrack.recenttracks.track[0].name,
			trackURL: lastTrack.recenttracks.track[0].url,
			playcount: rData.track.userplaycount,
			cover:
				lastTrack.recenttracks.track[0].image[
					lastTrack.recenttracks.track[0].image.length - 1
				]["#text"],
			liked: op[rData.track.userloved],
			runtime: msToTS(rData.track.duration),
			scrobbles: lastTrack.recenttracks["@attr"].total,
			purl: `https://www.last.fm/user/${lastTrack.recenttracks["@attr"].user}`,
			description: !lastTrack.recenttracks.track[0]["@attr"]
				? `Currently not listening. Last scrobbled at ${lastTrack.recenttracks.track[0].date["#text"]}. `
				: "Now scrobbling. ",
		};
		return data;
	}
};
