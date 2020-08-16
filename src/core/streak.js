const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");

module.exports = class streakCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "streak",
			aliases: ["streaks", "combo", "combos", "listeningstreaks"],
			group: "core",
			memberName: "streak",
			description:
				"Displays an embed with the listening streaks for artists, albums, and tracks.",
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
				[View Profile](${data.purl}) for ${userData.user}
				> **Current listening streaks for ${userData.user}**
				> Artist: ${data.artistStreak} consecutive plays - [${data.artist}](${data.artistURL})
				> Album: ${data.albumStreak} consecutive plays - [${data.album}](${data.albumURL})
				> Track: ${data.trackStreak} consecutive plays - [${data.trackName}](${data.trackURL})
				`,
			)
			.setThumbnail(data.cover)
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
				limit: "1000",
			},
		};
		const rData = await rp(options);
		const tracks = rData.recenttracks.track;
		const streakTrack = rData.recenttracks.track[0];
		var trackStreak = 0;
		var albumStreak = 0;
		var artistStreak = 0;
		var artistBreak = 0;
		var albumBreak = 0;
		var trackBreak = 0;
		for (let i = 0; i <= tracks.length - 1; i++) {
			if (
				tracks[i].artist["#text"] === streakTrack.artist["#text"] &&
				!artistBreak
			) {
				artistStreak++;
			} else {
				artistBreak++;
			}
			if (
				tracks[i].album["#text"] === streakTrack.album["#text"] &&
				!albumBreak
			) {
				albumStreak++;
			} else {
				albumBreak++;
			}
			if (tracks[i].name === streakTrack.name && !trackBreak) {
				trackStreak++;
			} else {
				trackBreak++;
			}
		}
		const artistEncoded = encodeURIComponent(streakTrack.artist["#text"]);
		const albumEncoded = encodeURIComponent(streakTrack.album["#text"]);
		const data = {
			trackStreak,
			albumStreak,
			artistStreak,
			artist: rData.recenttracks.track[0].artist["#text"],
			trackName: rData.recenttracks.track[0].name,
			trackURL: rData.recenttracks.track[0].url,
			albumURL: `https://www.last.fm/music/${artistEncoded}/${albumEncoded}`,
			artistURL: `https://www.last.fm/music/${artistEncoded}`,
			album: rData.recenttracks.track[0].album["#text"],
			cover: rData.recenttracks.track[0].image[rData.recenttracks.track[0].image.length -1]["#text"],
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
