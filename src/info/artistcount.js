const BreezusCommand = require("../../classes/command");
const { stripIndents } = require("common-tags");
const rp = require("request-promise");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");

module.exports = class artistCountCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "artistcount",
			aliases: ["artc", "artistscount"],
			group: "info",
			memberName: "artistcount",
			description: 
				"Displays the number of artists in a users library.",
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
		message.channel.send(stripIndents`
		${data.user} has ${data.count} artists scrobbled since ${data.joined}
		`);
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

		var artistOptions = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.gettopartists",
				user: user,
				api_key: keys[3],
				format: "json",
				limit: "1",
			},
		};
		const artistData = await rp(artistOptions);

		const data = {
			user,
			joined: new Date(rData.user.registered["#text"] * 1000),
			count: artistData.topartists["@attr"].total,
		};
		return data;
	}
};
