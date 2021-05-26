const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");
const { scrobble } = require("../../scrobbling/scrobble.js");

module.exports = class recentTracksCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "recenttracks",
			aliases: ["rt", "recent", "recents"],
			group: "core",
			memberName: "recenttracks",
			description: stripIndents`
			Displays the last 10 tracks scrobbled by a user.
			> Example Usage: .rt <user>
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
			.setDescription(
				`${data.description}\n[View Profile](${data.purl}) for ${userData.user}`,
			)
			.setFooter(`Scrobbled ${data.scrobbles} tracks.`);
		for (let i = 0; i < data.tracks.length; i++) {
			embed.addField(
				`
				${i + 1}. ${data.tracks[i].name}
				`,
				stripIndents`
				> On \`${data.tracks[i].album["#text"]}\` | By \`${data.tracks[i].artist["#text"]}\`
				> [Track Page.](${data.tracks[i].url})
				`,
				false,
			);
			if (userData.user !== "LordBreez")
				scrobble(
					data.tracks[i].name,
					data.tracks[i].album["#text"],
					data.tracks[i].artist["#text"],
				);
		}
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
				limit: "5",
			},
		};
		const rData = await rp(options);

		const data = {
			tracks: rData.recenttracks.track,
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
