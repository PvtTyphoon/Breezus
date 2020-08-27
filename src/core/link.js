const BreezusCommand = require("../../classes/command");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { apiRoot, keys } = require("../../config.json");

module.exports = class linkCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "link",
			aliases: ["lookup"],
			group: "core",
			memberName: "link",
			description: stripIndents`
			Searches for, and links to a last.fm profile.
			\`\`\`Example Usage: .link <user>\`\`\`
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

		message.channel.send(stripIndents`
		🔗 Link to \`${data.user}\`'s profile: ${data.purl}
		`);
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
				limit: "1",
			},
		};
		const rData = await rp(options);

		const data = {
			purl: `https://www.last.fm/user/${rData.recenttracks["@attr"].user}`,
			user,
		};
		return data;
	}
};
