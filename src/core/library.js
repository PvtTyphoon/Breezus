const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");
const { stripIndents } = require("common-tags");

module.exports = class libraryCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "library",
			aliases: ["lib"],
			group: "core",
			memberName: "library",
			description: stripIndents`
			Displays library statistics for a user.
			> Example Usage: .lib <user>
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
				stripIndents`[View profile for ${data.username}](${data.url})
				Joined ${data.registered.toUTCString()}`,
			)
			.addField(`❯ Total Tracks`, data.trackCount, false)
			.addField(`❯ Total Albums`, data.albumCount, false)
			.addField(`❯ Total Artists`, data.artistCount, false)
			.addField(`❯ Total Scrobbles`, data.scrobbles, false)
			.setThumbnail(data.avatar.replace(/jpg|jpeg|png/gi, "gif"));
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
				limit: "1",
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
				limit: "1",
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
				limit: "1",
			},
		};
		const trackData = await rp(trackOptions);

		const data = {
			username: user,
			scrobbles: rData.user.playcount,
			registered: new Date(rData.user.registered["#text"] * 1000),
			avatar: rData.user.image[rData.user.image.length - 1]["#text"],
			url: rData.user.url,
			trackCount: trackData.toptracks["@attr"].total,
			artistCount: artistData.topartists["@attr"].total,
			albumCount: albumData.topalbums["@attr"].total,
		};
		return data;
	}
};
