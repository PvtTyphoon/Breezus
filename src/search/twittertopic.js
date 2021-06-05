const BreezusCommand = require("../../classes/command");
const BreezusEmbed = require("../../classes/breezusEmbed");
const { stripIndents } = require("common-tags");
const rp = require("request-promise");
const { paginationEmbed } = require("../../util/pagination");
const { twitter } = require("../../config.json");

var Twit = require("twit");
var tweeter = new Twit({
	consumer_key: twitter.consumerKey,
	consumer_secret: twitter.consumerSecret,
	access_token: twitter.accessToken,
	access_token_secret: twitter.accessSecret,
	strictSSL: true,
});

module.exports = class lookupCommand extends BreezusCommand {
	constructor(client) {
		super(client, {
			name: "twittertopic",
			aliases: ["twitter", "tt"],
			group: "search",
			memberName: "twittertopic",
			description: stripIndents`
			Searches twitter for a topic and returns the results.
			> Example Usage: .twitter [query]
			`,
		});
	}

	async run(message) {
		message.channel.startTyping();
		message.channel.stopTyping();
		const args = message.content.trim().split(/ +/g).slice(1);
		let query = args.slice(0).join(" ");
		if (!query.length) return message.reply("Please provide a search query.");
		var data = await this.fetchData(query);
		if (!data.length)
			return message.reply("No results retuned by Twitter for that topic.");
		var pages = [];

		for (let i = 0; i < data.length; i++) {
			const embed = new BreezusEmbed(message)
				.setTitle(`${data[i].username} (@${data[i].handle})`)
				.setDescription(
					stripIndents`
			User since ${data[i].userCreatedAt}. ${data[i].userLocation}
			[User Profile.](${data[i].userURL})
			
			**Tweeted on ${data[i].time}:**
			>>> ${data[i].tweet}
			`,
				)
				.addField(
					"Engagement",
					stripIndents`			
			**${data[i].likes}  <:twitterLiked:848546781322936340>    ${data[i].retweets}  <:twitterRetweeted:848546842174423051>**
			[Go to Tweet.](${data[i].url})
			`,
					false,
				)
				.setThumbnail(data[i].pfp);
			pages.push(embed);
		}
		paginationEmbed(message, pages);
	}
	async fetchData(query) {
		var rData = await tweeter.get("search/tweets", {
			q: query,
			count: 25,
			result_type: "popular",
		});
		var data = [];
		for (let i = 0; i < rData.data.statuses.length; i++) {
			data.push({
				username: rData.data.statuses[i].user.name,
				handle: rData.data.statuses[i].user.screen_name,
				tweet: rData.data.statuses[i].text,
				url: `https://twitter.com/i/web/status/${rData.data.statuses[i].id_str}`,
				pfp: rData.data.statuses[i].user.profile_image_url_https,
				time: new Date(rData.data.statuses[i].created_at).toDateString(),
				retweets: rData.data.statuses[i].retweet_count,
				likes: rData.data.statuses[i].favorite_count,
				userDescription: rData.data.statuses[i].user.description
					? `**User Description:** ${rData.data.statuses[i].user.description}`
					: "",
				userLocation: rData.data.statuses[i].user.location
					? `**Location:** ${rData.data.statuses[i].user.location}`
					: "",
				userCreatedAt: new Date(
					rData.data.statuses[i].user.created_at,
				).toDateString(),
				userURL: `https://twitter.com/${rData.data.statuses[i].user.screen_name}`,
			});
		}
		return data;
	}
};
