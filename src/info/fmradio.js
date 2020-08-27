const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const rp = require("request-promise");
const { stripIndents } = require("common-tags");
const { apiRoot, keys, users } = require("../../config.json");
const { handleError } = require("../../errorHandling/errorHandling");

module.exports = class npRadioCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "fmradio",
			aliases: ["radio", "npradio", "nps"],
			group: "info",
			memberName: "fmradio",
			description: stripIndents`
			Displays all songs currently being played by Breezus users.
			\`\`\`Example Usage: .radio\`\`\`
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		try {
			var lbData = await this.fetchTrackData();
		} catch (err) {
			handleError(err, message);
			return;
		}
		const embed = new BreezusEmbed(message)
			.setTitle(`Currently playing radio.`)
			.setDescription(
				`**\`\`\`${lbData.length} Breezus user(s) are listening to music right now.\`\`\`**`,
			)
			.setFooter("Breezus Radio");
		for (let i = 0; i < lbData.length; i++) {
			embed.addField(lbData[i].dTitle, lbData[i].dTag, false);
		}
		message.channel.send({ embed });
	}

	async fetchTrackData() {
		var options = {
			uri: apiRoot,
			json: true,
			qs: {
				method: "user.getrecenttracks",
				api_key: keys[1],
				format: "json",
				limit: "1",
			},
		};
		var lastTrack;
		const lbData = [];
		for (let i = 0; i < users.length; i++) {
			options.qs.user = users[i];
			lastTrack = await rp(options);
			if (lastTrack.recenttracks.track[0]["@attr"]) {
				lbData.push({
					dTitle: users[i],
					dTag: stripIndents`
					> Track: **[${lastTrack.recenttracks.track[0].name}](${lastTrack.recenttracks.track[0].url})**
					> On \`${lastTrack.recenttracks.track[0].album["#text"]}\`
					> By \`${lastTrack.recenttracks.track[0].artist["#text"]}\`
					`,
				});
			}
		}
		return lbData;
	}
};
