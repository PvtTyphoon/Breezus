const BreezusCommand = require("../../classes/command");
const Discord = require("discord.js");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { getUser } = require("../../util/lastfmUserGetter");
const { handleError } = require("../../errorHandling/errorHandling");
const { generatePieChart } = require("../../util/charts/pieChart");
const { apiRoot, keys } = require("../../config.json");

module.exports = class artistChartCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "artists",
			aliases: ["artistchart", "artistscharts"],
			group: "charts",
			memberName: "artists",
			description: stripIndents`
			Generates a pie chart of the top 5 artists from the last 7 days.
			> Example Usage: .artists <user>
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		try {
			var userData = await getUser(message);
			var data = await this.fetchData(userData.user);
			if (data.labels.length !== 5)
				return message.channel.send(stripIndents`
			${userData.user} has not listened to enough music in the last 7 days to generate a chart. Fetched ${data.count.length} out of required artists.
			`);
			let image = await generatePieChart(data.count, data.labels);
			const attachment = new Discord.MessageAttachment(image);
			message.channel.send(
				`Top 5 artists for ${userData.user} over the last 7 days.`,
				attachment,
			);
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
				method: "user.gettopartists",
				user: user,
				api_key: keys[0],
				format: "json",
				limit: "5",
				period: "7day",
			},
		};
		const rData = await rp(options);
		const count = [];
		const labels = [];
		for (let i = 0; i < rData.topartists.artist.length; i++) {
			count.push(rData.topartists.artist[i].playcount);
			labels.push(
				`${rData.topartists.artist[i].name} : ${rData.topartists.artist[i].playcount} scrobbles`,
			);
		}
		const data = {
			count,
			labels,
		};
		return data;
	}
};
